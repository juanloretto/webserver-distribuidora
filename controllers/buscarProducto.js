import { response, request } from "express";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

import Producto from "../models/producto.js";


// buscar productos
const buscarProducto = async (termino, res = response) => {
  //verificar si en vez del nombre me manda el id
  //con esto valido si el termino que manda el front es un id y lo valido
  const isMongoId = ObjectId.isValid(termino);

  if (isMongoId) {
    const producto = await Producto.findById(termino)
      .populate("categoria", "nombre");
    //si categoria obtuvo algo que me devuelva en un array la categoria, sino que me devuelva un  array vacio
    return res.json({
      results: producto ? [producto] : [],
    });
  }
  // 🔍 Búsqueda por nombre o código (Excel)
  const regex = new RegExp(termino, "i");

  const productos = await Producto.find({
    estado: true,
    $or: [
      { nombre: regex },
      { codigo: regex },
    ],
  })
    .populate("categoria", "nombre")
    .limit(10);

  res.json({
    results: productos,
  });
};


  switch (coleccion) {
    case "categorias":
      buscarCategoria(termino, res);
      break;
    case "productos":
      buscarProducto(termino, res);
      break;

    default:
      res.status(500).json({
        msg: "No se generaron las búsquedas",
      });
      break;
  }


export default buscar;
