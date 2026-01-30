import mongoose from "mongoose";
import Pedido from "../models/pedido.js";

const cambiarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const usuario = req.usuario;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de pedido inválido" });
    }

    // 🔐 Solo admin
    if (usuario.rol !== "ADMIN_ROLE") {
      return res.status(403).json({
        msg: "No tiene permisos para cambiar el estado del pedido",
      });
    }

    const estadosPermitidos = ["FACTURADO", "ENTREGADO"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        msg: `Estado inválido. Permitidos: ${estadosPermitidos.join(", ")}`,
      });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    // 🧠 Validar flujo correcto
    if (estado === "FACTURADO" && pedido.estado !== "PENDIENTE") {
      return res.status(400).json({
        msg: "Solo se puede FACTURAR un pedido PENDIENTE",
      });
    }

    if (estado === "ENTREGADO" && pedido.estado !== "FACTURADO") {
      return res.status(400).json({
        msg: "Solo se puede ENTREGAR un pedido FACTURADO",
      });
    }

    pedido.estado = estado;
    await pedido.save();

    res.json({
      msg: `Pedido actualizado a estado ${estado}`,
      pedido,
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error);
    res.status(500).json({
      msg: "Error al cambiar el estado del pedido",
      error: error.message,
    });
  }
};

export { cambiarEstadoPedido };
