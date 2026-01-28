import { request, response } from "express";
import mongoose from "mongoose";
import Categoria from "../models/categoria.js";

const { ObjectId } = mongoose.Types;

const buscarCategoria = async (req = request, res = response) => {
  const { termino } = req.params;

  const esMongoId = ObjectId.isValid(termino);

  // 🔍 Buscar por ID
  if (esMongoId) {
    const categoria = await Categoria.findById(termino);

    return res.json({
      results: categoria && categoria.estado ? [categoria] : [],
    });
  }

  // 🔍 Buscar por nombre
  const regex = new RegExp(termino, "i");

  const categorias = await Categoria.find({
    estado: true,
    nombre: regex,
  }).limit(10);

  res.json({
    results: categorias,
  });
};

export default buscarCategoria;