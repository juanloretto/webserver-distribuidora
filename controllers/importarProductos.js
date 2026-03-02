import fs from "fs";
import csv from "csv-parser";
import Producto from "../models/producto.js";
import Categoria from "../models/categoria.js";
import { parsePrecio } from "../helpers/parsePrecio.js";

export const importarProductos = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No se envió ningún archivo" });
    }

    const normalizar = (texto) =>
      texto
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();

    const productos = [];
    const errores = [];

    // Traer todas las categorías existentes
    const categoriasDB = await Categoria.find();
    const mapaCategorias = {};
    categoriasDB.forEach((cat) => {
      mapaCategorias[normalizar(cat.nombre)] = cat._id;
    });

    fs.createReadStream(req.file.path)
      .pipe(
        csv({
          headers: [
            "Articulo",
            "Descripcion",
            "Rubro",
            "CON EL 20%",
            "Stock",
            "img",
          ],
          skipLines: 1,
        }),
      )
      .on("data", async (row) => {
        try {
          if (row.Articulo === "Articulo") return;
          if (!row.Articulo || !row.Descripcion) {
            errores.push({ row, error: "Faltan datos obligatorios" });
            return;
          }

          const rubro = normalizar(row.Rubro);
          let categoriaId = mapaCategorias[rubro];

          if (!categoriaId && rubro) {
            try {
              const nuevaCategoria = new Categoria({ nombre: rubro });
              await nuevaCategoria.save();
              categoriaId = nuevaCategoria._id;
              mapaCategorias[rubro] = categoriaId;
            } catch (err) {
              const catExistente = await Categoria.findOne({ nombre: rubro });
              if (catExistente) {
                categoriaId = catExistente._id;
                mapaCategorias[rubro] = categoriaId;
              } else {
                errores.push({
                  row,
                  error: `Error creando categoría: ${err.message}`,
                });
                return;
              }
            }
          }

          if (!categoriaId) {
            errores.push({ row, error: "Categoría no encontrada ni creada" });
            return;
          }

          const precio = parsePrecio(row["CON EL 20%"]);
          if (precio === null) {
            errores.push({ row, error: "Precio inválido" });
            return;
          }

          const stock = row.Stock
            ? parseInt(row.Stock.replace(/\D/g, ""), 10)
            : 0;
          if (isNaN(stock) || stock < 0) {
            errores.push({ row, error: "Stock inválido" });
            return;
          }

          // 🔹 Guardar la URL de la imagen directamente
          const imagen =
            row.img && row.img.trim() !== ""
              ? row.img.replace(/(^"|"$)/g, "").trim()
              : "/placeholder.png";
          if (row.Articulo && row.Descripcion && categoriaId) {
            productos.push({
              updateOne: {
                filter: { codigo: row.Articulo.trim() },
                update: {
                  $set: {
                    codigo: row.Articulo.trim(),
                    nombre: row.Descripcion.trim(),
                    descripcion: row.Descripcion.trim(),
                    categoria: categoriaId,
                    precio,
                    stock,
                    estado: true,
                    img: imagen, // ✅ guardamos la URL
                  },
                },
                upsert: true,
              },
            });
          }
        } catch (err) {
          errores.push({ row, error: err.message });
        }
      })
      .on("end", async () => {
        try {
          if (productos.length > 0) {
            await Producto.bulkWrite(productos);
          }

          fs.unlinkSync(req.file.path);

          res.json({
            totalProcesados: productos.length,
            errores: errores.length,
            detalleErrores: errores,
            msg: "Importación finalizada",
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ msg: error.message });
        }
      });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export default importarProductos;
