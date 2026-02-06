import { response, request } from "express";
import mongoose from "mongoose";
import Cliente from "../models/cliente.js";

const { ObjectId } = mongoose.Types;

const buscarCliente = async (req = request, res = response) => {
  const { termino } = req.params;
  const vendedor = req.usuario; // ✅ CONSISTENTE

  if (!vendedor) {
    return res.status(401).json({
      msg: "Usuario no autenticado",
    });
  }

  const isMongoId = ObjectId.isValid(termino);

  if (isMongoId) {
    const cliente = await Cliente.findOne({
      _id: termino,
      vendedor,
      estado: true,
    });

    return res.json({
      clientes: cliente ? [cliente] : [],
    });
  }

  const regex = new RegExp(termino, "i");

  const clientes = await Cliente.find({
    estado: true,
    vendedor,       // 🔥 AHORA SÍ
    nombre: regex,
  }).limit(10);

  res.json({
    clientes,
  });
};

export default buscarCliente;