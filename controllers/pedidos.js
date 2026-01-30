import mongoose from "mongoose";
import Pedido from "../models/pedido.js";
import Producto from "../models/producto.js";
import Cliente from "../models/cliente.js";

const crearPedido = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vendedor = req.usuario; // viene del middleware JWT
    const { clienteId, clienteNuevo, items, observaciones } = req.body;

    // 🔐 Validar vendedor
    if (!vendedor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    // 1️⃣ Validar items
    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "El pedido debe tener productos" });
    }

    // 2️⃣ Resolver cliente
    let cliente;

    if (clienteId) {
      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "Cliente inválido" });
      }

      cliente = await Cliente.findOne({
        _id: clienteId,
        estado: true,
      }).session(session);

      if (!cliente) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ msg: "Cliente no encontrado o inactivo" });
      }
    } else if (clienteNuevo) {
      if (!clienteNuevo.nombre) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ msg: "El nombre del cliente es obligatorio" });
      }

      cliente = new Cliente({
        ...clienteNuevo,
        vendedor,
      });

      await cliente.save({ session });
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Debe indicar un cliente" });
    }

    // 3️⃣ Procesar productos
    const snapshotItems = [];
    let total = 0;

    for (const item of items) {
      const { productoId, cantidad } = item;

      if (
        !mongoose.Types.ObjectId.isValid(productoId) ||
        !Number.isInteger(cantidad) ||
        cantidad < 1
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "Producto o cantidad inválida" });
      }

      const producto = await Producto.findOne({
        _id: productoId,
        estado: true,
      }).session(session);

      if (!producto) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: "Producto no disponible" });
      }

      if (producto.stock < cantidad) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          msg: `Stock insuficiente para ${producto.nombre}`,
        });
      }

      const subtotal = producto.precio * cantidad;
      total += subtotal;

      // 📸 SNAPSHOT (clave del sistema)
      snapshotItems.push({
        producto: producto._id, // interno
        codigo: producto.codigo, // 🔑 externo (Excel / facturación)
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad,
        subtotal,
      });

      // descontar stock
      producto.stock -= cantidad;
      await producto.save({ session });
    }

    if (total <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Total inválido" });
    }

    // 4️⃣ Crear pedido
    const pedido = new Pedido({
      vendedor,
      cliente: cliente._id,
      items: snapshotItems,
      total,
      observaciones,
      estado: "PENDIENTE",
    });

    await pedido.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      msg: "Pedido creado correctamente",
      pedido,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("❌ Error al crear pedido:", error);

    res.status(500).json({
      msg: "Error al crear el pedido",
      error: error.message,
    });
  }
};

const obtenerPedidosAdmin = async (req, res) => {
  const { estado, vendedor, desde, hasta } = req.query;

  const query = {};

  if (estado) query.estado = estado;
  if (vendedor) query.vendedor = vendedor;

  if (desde || hasta) {
    query.createdAt = {};
    if (desde) query.createdAt.$gte = new Date(desde);
    if (hasta) query.createdAt.$lte = new Date(hasta);
  }

  const pedidos = await Pedido.find(query)
    .populate("cliente", "nombre")
    .populate("vendedor", "nombre email")
    .sort({ createdAt: -1 });

  res.json({
    total: pedidos.length,
    pedidos,
  });
};
const obtenerPedidosVendedor = async (req, res) => {
  try {
    const vendedorId = req.usuario?._id;
    const { estado } = req.query;

    if (!vendedorId) {
      return res.status(401).json({
        msg: "Usuario no autenticado",
      });
    }

    const query = { vendedor: vendedorId };
    if (estado) query.estado = estado;

    const pedidos = await Pedido.find(query)
      .populate("cliente", "nombre")
      .sort({ createdAt: -1 });

    res.json({
      total: pedidos.length,
      pedidos,
    });
  } catch (error) {
    console.error("❌ Error al obtener pedidos del vendedor:", error);

    res.status(500).json({
      msg: "Error al obtener los pedidos",
      error: error.message,
    });
  }
};



export { crearPedido, obtenerPedidosAdmin, obtenerPedidosVendedor };
