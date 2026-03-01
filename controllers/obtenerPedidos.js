import Pedido from "../models/pedido.js";
import Cliente from "../models/cliente.js";

const obtenerPedidosAdmin = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (usuario.rol !== "ADMIN_ROLE") {
      return res.status(403).json({
        msg: "No tiene permisos para ver todos los pedidos",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const { estado, cliente } = req.query;
    const normalizarTexto = (texto) => {
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    let filtro = {};

    if (estado) {
      filtro.estado = estado;
    }

    // 🔥 BUSQUEDA SIN TILDES
    if (cliente) {
      const clienteNormalizado = normalizarTexto(cliente);

      const clientes = await Cliente.find().select("_id nombre");

      const clientesFiltrados = clientes.filter((c) =>
        normalizarTexto(c.nombre)
          .toLowerCase()
          .includes(clienteNormalizado.toLowerCase()),
      );

      const clientesIds = clientesFiltrados.map((c) => c._id);

      filtro.cliente = { $in: clientesIds };
    }

    const total = await Pedido.countDocuments(filtro);

    const pedidos = await Pedido.find(filtro)
      .populate("cliente", "nombre")
      .populate("vendedor", "nombre")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      total,
      page,
      totalPages,
      pedidos,
    });
  } catch (error) {
    console.error("❌ Error al obtener pedidos admin:", error);
    res.status(500).json({
      msg: "Error al obtener pedidos",
      error: error.message,
    });
  }
};

export { obtenerPedidosAdmin };
