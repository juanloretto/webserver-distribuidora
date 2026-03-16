import { response, request } from "express";
import Producto from "../models/producto.js";
import mongoose from "mongoose";

const obtenerProducto = async (req = request, res = response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  const producto = await Producto.findById(id)
    .select("-stock")
    .populate("categoria", "nombre");

  if (!producto) {
    return res.status(404).json({ msg: "Producto no encontrado" });
  }

  res.json({ producto });
};

// Get para traer todos los productos paginados
const obtenerProductos = async (req = request, res = response) => {
  try {
    const { limite = 12, desde = 0, termino = "", estado = "true" } = req.query;

    const query = {
      estado: estado === "true",
    };

    if (termino) {
      const regex = new RegExp(termino, "i");
      query.$or = [{ nombre: regex }, { codigo: regex }];
    }

    const [total, productos] = await Promise.all([
      Producto.countDocuments(query),
      Producto.find(query)
        .select("-stock")
        .populate("categoria", "nombre")
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ nombre: 1 }),
    ]);

    res.json({
      total,
      paginaActual: Math.floor(desde / limite) + 1,
      totalPaginas: Math.ceil(total / limite),
      productos,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al obtener productos",
      error: error.message,
    });
  }
};

const productoPost = async (req, res) => {
  const { precio, categoria, descripcion, img, codigo, stock } = req.body;
  const nombre = req.body.nombre.toUpperCase();
  const codigoNormalizado = codigo.trim();

  try {
    const productoDB = await Producto.findOne({ codigo: codigoNormalizado });

    if (productoDB) {
      return res.status(400).json({
        msg: `Ya existe un producto con el código ${productoDB.codigo}`,
      });
    }

    const data = {
      nombre,
      categoria,
      precio,
      descripcion,
      img,
      codigo: codigoNormalizado,
      stock,
    };

    const producto = new Producto(data);
    await producto.save();

    return res.status(201).json({
      msg: "Producto creado con éxito",
      producto,
    });
  } catch (error) {
    res.status(400).json({
      msg: "Error al crear producto",
      error: error.message,
    });
  }
};

const actualizarProducto = async (req = request, res = response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  const allowedFields = [
    "nombre",
    "codigo",
    "precio",
    "stock",
    "descripcion",
    "img",
    "categoria",
    "estado",
  ];

  const data = Object.fromEntries(
    Object.entries(req.body)
      .filter(([key]) => allowedFields.includes(key))
      .map(([key, value]) => {
        if (key === "nombre") return [key, value.toUpperCase()];
        if (key === "codigo") return [key, value.trim()];
        return [key, value];
      }),
  );

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      msg: "No hay campos válidos para actualizar",
    });
  }

  const producto = await Producto.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .select("-stock")
    .populate("categoria", "nombre");

  if (!producto) {
    return res.status(404).json({
      msg: `Producto con id ${id} no encontrado`,
    });
  }

  res.status(200).json({
    msg: "Producto actualizado correctamente",
    producto,
  });
};

const borrarProducto = async (req = request, res = response) => {
  const { id } = req.params;

  const productoBorrado = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true },
  ).select("-stock");

  const { nombre } = productoBorrado;

  res.status(200).json({
    msg: "El producto fue borrado",
    nombre,
    productoBorrado,
  });
};

export {
  productoPost,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  borrarProducto,
};