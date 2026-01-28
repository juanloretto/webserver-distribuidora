import { response, request } from "express";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

import Cliente from "../models/cliente.js";

const buscarCliente = async (req = request, res = response) => {
  const { termino } = req.params;

  const isMongoId = ObjectId.isValid(termino);
  if (isMongoId) {
    const cliente = await Cliente.findById(termino);
    return res.json({
      results: cliente ? [cliente] : [],
    });
  }
   // 🔍 Buscar SOLO por nombre
  const regex = new RegExp(termino, "i");

  const clientes = await Cliente.find({
    estado: true,
    nombre: regex,
  }).limit(10);

  res.json({
    results: clientes,
  });
};
export default buscarCliente;
