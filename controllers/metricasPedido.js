import Pedido from "../models/pedido.js";

const metricasPedidos = async (req, res) => {
  try {
    // 1️⃣ Pedidos por estado
    const pedidosPorEstado = await Pedido.aggregate([
      {
        $group: {
          _id: "$estado",
          total: { $sum: 1 },
        },
      },
    ]);

    // 2️⃣ Total vendido (solo FACTURADOS)
    const totalVendido = await Pedido.aggregate([
      {
        $match: { estado: "FACTURADO" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    // 3️⃣ Pedidos por vendedor
    const pedidosPorVendedor = await Pedido.aggregate([
      {
        $group: {
          _id: "$vendedor",
          cantidadPedidos: { $sum: 1 },
          totalVendido: { $sum: "$total" },
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "_id",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $unwind: "$vendedor",
      },
      {
        $project: {
          _id: 0,
          vendedor: "$vendedor.nombre",
          cantidadPedidos: 1,
          totalVendido: 1,
        },
      },
    ]);

    res.json({
      pedidosPorEstado,
      totalVendido: totalVendido[0]?.total || 0,
      pedidosPorVendedor,
    });
  } catch (error) {
    console.error("❌ Error métricas pedidos:", error);
    res.status(500).json({
      msg: "Error al obtener métricas",
      error: error.message,
    });
  }
};

export { metricasPedidos };
