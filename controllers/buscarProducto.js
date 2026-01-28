import { response, request } from "express";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

import Producto from "../models/producto.js";

// buscar productos
const buscarProducto = async (req = request, res = response) => {
  const { termino } = req.params;

  const isMongoId = ObjectId.isValid(termino);

  if (isMongoId) {
    const producto = await Producto.findById(termino).populate(
      "categoria",
      "nombre",
    );
    return res.json({
      results: producto ? [producto] : [],
    });
  }
  // 🔍 Búsqueda por nombre o código (Excel)
  const regex = new RegExp(termino, "i");

  const productos = await Producto.find({
    estado: true,
    $or: [{ nombre: regex }, { codigo: regex }],
  })
    .populate("categoria", "nombre")
    .limit(10);

  res.json({
    results: productos,
  });
};

export default buscarProducto;
