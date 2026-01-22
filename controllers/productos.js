import { response, request } from "express";
import Producto from "../models/producto.js";

//Get para traer todos los productos paginados--------------------
const obtenerProductos = async (req = request, res = response) => {
  let query = {};

  if (req.query.estado !== undefined) {
    query.estado = req.query.estado === "true";
  }

  const productos = await Producto.find(query)
    .populate("categoria", "nombre")
    .populate("usuario", "email");

  const total = await Producto.countDocuments(query);

  res.json({ total, productos });

};

//--------------------------------------------------------------
//obtener un producto por su ID
const obtenerProducto = async (req = request, res = response) => {
  const { id } = req.params;

  const producto = await Producto.findById(id)
    .populate("categoria", "nombre")
    .populate("usuario", "email");

  res.json({
    producto,
  });
};

const productoPost = async (req, res) => {
  const { precio, categoria, descripcion, img, stock } = req.body;

  const nombre = req.body.nombre.toUpperCase();

  const productoDB = await Producto.findOne({ nombre });

  if (productoDB) {
    return res.status(400).json({
      msg: `El producto ${productoDB.nombre} ya existe`,
    });
  }
  //Generar la data a guardar
  const data = {
    nombre,
    categoria,
    precio,
    descripcion,
    img,
    stock,
    usuario: req.usuario._id,
  };

  const producto = new Producto(data);

  //grabar en la base de datos
  await producto.save();

  res.status(201).json({
    msg: "Se agregó producto",
  });
};

//actualizarProducto (validar nombre)-----------------------------------------

const actualizarProducto = async (req = request, res = response) => {
  const { id } = req.params;
  console.log("ID recibido en backend:", id);
  const { precio, categoria, descripcion, disponible, estado } = req.body;

  // Buscamos el producto en la base de datos
  const productoDB = await Producto.findById(id);

  if (!productoDB) {
    return res.status(404).json({
      message: `Producto con id ${id} no encontrado`,
    });
  }

  // Si el estado viene en false, lo cambiamos a true
  let nuevoEstado = estado;
  if (productoDB.estado === false) {
    nuevoEstado = true;
  }
  //guardamos id de usuario
  const usuario = req.usuario._id;

  //creamos la data
  let data = {
    precio,
    descripcion,
    categoria,
    disponible,
    usuario,
    estado:nuevoEstado,
  };
  
  //si viene el nombre al momento de actualizar
  if (req.body.nombre) {
    data.nombre = req.body.nombre.toUpperCase();
  }
  //si viene el stock en el body
  if (req.body.stock) {
    data.stock = req.body.stock;
  }
  //si viene la imagen
  if (req.body.img) {
    data.img = req.body.img;
  }

  //actualizamos el producto y lo devolvemos ya con lo actualizamos
  const producto = await Producto.findByIdAndUpdate(id, data, { new: true })
    .populate("categoria", "nombre")
    .populate("usuario", "email");

  res.status(200).json({
    producto,
    msg: "Producto actualizado!",
  });
};

const borrarProducto = async (req = request, res = response) => {
  const { id } = req.params;
  //la actualizacion es cambiar el estado a false
  const productoBorrado = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  const { nombre } = productoBorrado;

  res.status(200).json({
    msg: "El producto fue borrado",
    nombre,
    productoBorrado,
  });
};
//para borrar productos en un estado en false
// const borrarProductos = async (req, res) => {

//   const query={estado:false}

//   await Producto.findAndRemove(query)

//    res.status(200).json({
//     msg: "Se borraron todos los productos inactivos",

//   });
// };

export {
  productoPost,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  borrarProducto,
};
