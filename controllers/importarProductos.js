import fs from "fs";
import csv from "csv-parser";
import Producto from "../models/producto.js";
import Categoria from "../models/categoria.js";
import { parsePrecio } from "../helpers/parsePrecio.js";

const importarProductos = async (req, res) => {
    
  console.log("🔥🔥🔥 CONTROLLER importarProductos EJECUTADO 🔥🔥🔥");
  let filePath = req.file?.path;

  try {
    console.log("🚀 Iniciando importación de productos");

    if (!req.file) {
      console.log("⛔ No se envió ningún archivo");
      return res.status(400).json({ msg: "No se envió ningún archivo" });
    }

    console.log("📁 Archivo recibido:", filePath);

    const normalizar = (texto = "") =>
      String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();

    const limpiarTexto = (texto = "") =>
      String(texto)
        .replace(/(^"|"$)/g, "")
        .trim();

    const leerCsv = () =>
      new Promise((resolve, reject) => {
        const filas = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            filas.push(row);
          })
          .on("end", () => resolve(filas))
          .on("error", (error) => reject(error));
      });

    const filas = await leerCsv();

    console.log("📄 Filas leídas del CSV:", filas.length);

    if (filas.length > 0) {
      console.log("🧾 Primera fila CSV:", filas[0]);
    }

    const categoriasDB = await Categoria.find();
    const mapaCategorias = {};

    categoriasDB.forEach((cat) => {
      mapaCategorias[normalizar(cat.nombre)] = cat._id;
    });

    console.log("📚 Categorías precargadas:", categoriasDB.length);

    const productos = [];
    const errores = [];

    for (let i = 0; i < filas.length; i++) {
      const row = filas[i];

      try {
        const codigo = limpiarTexto(row.Articulo);
        const descripcion = limpiarTexto(row.Descripcion);
        const rubroOriginal = limpiarTexto(row.Rubro);
        const rubroNormalizado = normalizar(rubroOriginal);

        if (!codigo || !descripcion) {
          errores.push({
            fila: i + 2,
            row,
            error: "Faltan datos obligatorios",
          });
          continue;
        }

        let categoriaId = mapaCategorias[rubroNormalizado];

        if (!categoriaId && rubroNormalizado) {
          try {
            console.log(`📂 Creando categoría nueva: ${rubroOriginal}`);

            const nuevaCategoria = await Categoria.create({
              nombre: rubroOriginal.toUpperCase(),
            });

            categoriaId = nuevaCategoria._id;
            mapaCategorias[rubroNormalizado] = categoriaId;

            console.log(`✅ Categoría creada: ${rubroOriginal}`);
          } catch (err) {
            const catExistente = await Categoria.findOne({
              nombre: rubroOriginal.toUpperCase(),
            });

            if (catExistente) {
              categoriaId = catExistente._id;
              mapaCategorias[rubroNormalizado] = categoriaId;
              console.log(`♻️ Categoría reutilizada: ${rubroOriginal}`);
            } else {
              errores.push({
                fila: i + 2,
                row,
                error: `Error creando categoría: ${err.message}`,
              });
              continue;
            }
          }
        }

        if (!categoriaId) {
          errores.push({
            fila: i + 2,
            row,
            error: "Categoría no encontrada ni creada",
          });
          continue;
        }

        const listasPrecios = [];

        Object.keys(row).forEach((columna) => {
          const nombreColumna = limpiarTexto(columna);

          if (/^lista\d+$/i.test(nombreColumna)) {
            const precioParseado = parsePrecio(row[columna]);

            if (precioParseado !== null && !isNaN(precioParseado)) {
              const numeroLista = nombreColumna.replace(/\D/g, "");
              const nombreListaNormalizado = `Lista${numeroLista}`;

              listasPrecios.push({
                nombre: nombreListaNormalizado,
                precio: precioParseado,
              });
            }
          }
        });

        listasPrecios.sort((a, b) => {
          const numA = parseInt(a.nombre.replace(/\D/g, ""), 10);
          const numB = parseInt(b.nombre.replace(/\D/g, ""), 10);
          return numA - numB;
        });

        if (i === 0) {
          console.log("💰 Listas detectadas en primera fila:", listasPrecios);
        }

        if (listasPrecios.length === 0) {
          errores.push({
            fila: i + 2,
            row,
            error: "No se encontraron listas de precios válidas",
          });
          continue;
        }

        const lista1 = listasPrecios.find((lista) => lista.nombre === "Lista1");

        if (!lista1) {
          errores.push({
            fila: i + 2,
            row,
            error: "El producto no tiene Lista1, que es obligatoria",
          });
          continue;
        }

        const precio = lista1.precio;

        const stock = row.Stock
          ? parseInt(String(row.Stock).replace(/\D/g, ""), 10)
          : 0;

        if (isNaN(stock) || stock < 0) {
          errores.push({
            fila: i + 2,
            row,
            error: "Stock inválido",
          });
          continue;
        }

        const imagen =
          row.img && limpiarTexto(row.img) !== ""
            ? limpiarTexto(row.img)
            : "/placeholder.png";

        if (i < 3) {
          console.log(`🛒 Producto preparado [fila ${i + 2}]:`, {
            codigo,
            descripcion,
            rubro: rubroOriginal,
            precio,
            stock,
            img: imagen,
            listasPrecios,
          });
        }

        productos.push({
          updateOne: {
            filter: { codigo },
            update: {
              $set: {
                codigo,
                nombre: descripcion,
                descripcion,
                categoria: categoriaId,
                precio,
                listasPrecios,
                stock,
                estado: true,
                img: imagen,
              },
            },
            upsert: true,
          },
        });
      } catch (err) {
        console.error(`💥 Error procesando fila ${i + 2}:`, err.message);

        errores.push({
          fila: i + 2,
          row,
          error: err.message,
        });
      }
    }

    console.log("📦 Operaciones preparadas para bulkWrite:", productos.length);
    console.log("⚠️ Errores acumulados:", errores.length);

    if (errores.length > 0) {
      console.log("📋 Primeros errores:", errores.slice(0, 5));
    }

    let resultadoBulk = null;

    if (productos.length > 0) {
      resultadoBulk = await Producto.bulkWrite(productos);
      console.log("💾 Resultado bulkWrite:", resultadoBulk);
    }

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Archivo temporal eliminado");
    }

    return res.json({
      totalProcesados: productos.length,
      errores: errores.length,
      detalleErrores: errores,
      msg: "Importación finalizada",
    });
  } catch (error) {
    console.error("💥 Error general en importarProductos:", error);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Archivo temporal eliminado tras error");
    }

    return res.status(500).json({
      msg: "Error al importar productos",
      error: error.message,
    });
  }
};

export default importarProductos;
