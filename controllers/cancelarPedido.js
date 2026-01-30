import mongoose from "mongoose";
import Pedido from "../models/pedido.js";
import Producto from "../models/producto.js";

const cancelarPedido = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const usuario = req.usuario;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de pedido inválido" });
    }

    const pedido = await Pedido.findById(id).session(session);

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido no encontrado" });
    }

    // 🔐 REGLAS DE PERMISOS
    if (usuario.rol !== "ADMIN_ROLE") {
      // vendedor
      if (!pedido.vendedor.equals(usuario._id)) {
        return res.status(403).json({
          msg: "No puede cancelar pedidos de otro vendedor",
        });
      }

      if (pedido.estado !== "PENDIENTE") {
        return res.status(400).json({
          msg: "Solo puede cancelar pedidos en estado PENDIENTE",
        });
      }
    } else {
      // admin
      const estadosCancelables = ["PENDIENTE", "FACTURADO"];
      if (!estadosCancelables.includes(pedido.estado)) {
        return res.status(400).json({
          msg: `No se puede cancelar un pedido en estado ${pedido.estado}`,
        });
      }
    }

    // 🔁 DEVOLVER STOCK (snapshot)
    for (const item of pedido.items) {
      const producto = await Producto.findById(item.producto).session(session);

      if (!producto) {
        throw new Error("Producto no encontrado al devolver stock");
      }

      producto.stock += item.cantidad;
      await producto.save({ session });
    }

    // 🛑 CANCELAR PEDIDO
    pedido.estado = "CANCELADO";
    await pedido.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      msg: "Pedido cancelado correctamente",
      pedido,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("❌ Error al cancelar pedido:", error);
    res.status(500).json({
      msg: "Error al cancelar el pedido",
      error: error.message,
    });
  }
};

export { cancelarPedido };
