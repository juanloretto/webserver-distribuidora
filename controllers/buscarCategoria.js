import { response, request } from "express";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

import Producto from "../models/producto.js";
const coleccionesPermitidas = ["categorias", "productos"];

const buscarCategoria = async (termino, res = response) => {
  const isMongoId = ObjectId.isValid(termino);
  if (isMongoId) {
    const categoria = await Categoria.findById(termino).populate(
      "usuario",
      "nombre",
    );
    return res.json({
      results: categoria ? [categoria] : [],
    });
  }
  //realizar búsqueda por nombre
  const regex = new RegExp(termino, "i");
  const categorias = await Categoria.find({
    nombre: regex,
    estado: true,
  }).populate("usuario", "nombre");
  res.json({ results: categorias, }); 
};
const buscar = async (req = request, res = response) => {
  //desestructuro de la request los parametros que van en la url
  const { coleccion, termino } = req.params;

  //verificar si la coleccion es válida
  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      msg: `Las colecciones permitidas son ${coleccionesPermitidas}`,
    });
  }}
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