import Cliente from "../models/cliente.js";
import Producto from "../models/producto.js";
import Pedido from "../models/pedido.js";
import mongoose from "mongoose";

const redondear2 = (numero) => Number(Number(numero).toFixed(2));

const crearPedido = async (req, res) => {
  console.log("🚀 1 - Entró a crearPedido");

  const session = await mongoose.startSession();
  session.startTransaction();
  console.log("🟢 2 - Sesión iniciada");

  try {
    const vendedor = req.usuario;
    const { clienteId, items, observaciones } = req.body;

    console.log("📦 3 - Body recibido:", req.body);
    console.log("👤 4 - Usuario:", vendedor);

    if (!vendedor) {
      console.log("⛔ 5 - No hay vendedor");
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log("⛔ 6 - Items inválidos:", items);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "El pedido debe tener productos" });
    }

    let cliente;

    if (clienteId) {
      console.log("🔎 7 - Validando clienteId:", clienteId);

      if (!mongoose.Types.ObjectId.isValid(clienteId)) {
        console.log("⛔ 8 - clienteId inválido");
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: "Cliente inválido" });
      }

      cliente = await Cliente.findOne({
        _id: clienteId,
        estado: true,
        vendedor,
      }).session(session);

      console.log("👥 9 - Cliente encontrado:", cliente);

      if (!cliente) {
        console.log("⛔ 10 - Cliente no encontrado");
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ msg: "Cliente no encontrado o inactivo" });
      }
    } else {
      console.log("⛔ 11 - No se envió clienteId");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Debe indicar un cliente" });
    }

    const snapshotItems = [];
    let total = 0;

    console.log("🛒 12 - Iniciando loop de items");

    for (const item of items) {
      console.log("🔄 13 - Procesando item:", item);

      const { productoId, cantidad, lista } = item;

      if (
        !mongoose.Types.ObjectId.isValid(productoId) ||
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        !lista ||
        typeof lista !== "string"
      ) {
        console.log("⛔ 14 - Producto, cantidad o lista inválida", item);
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ msg: "Producto, cantidad o lista inválida" });
      }

      const producto = await Producto.findOne({
        _id: productoId,
        estado: true,
      }).session(session);

      console.log("📦 15 - Producto encontrado:", producto?.nombre);

      if (!producto) {
        console.log("⛔ 16 - Producto no disponible");
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: "Producto no disponible" });
      }

      const listaElegida = producto.listasPrecios?.find(
        (l) => l.nombre.trim().toUpperCase() === lista.trim().toUpperCase(),
      );

      if (!listaElegida) {
        console.log("⛔ 17 - Lista no encontrada en el producto");
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          msg: `La lista ${lista} no existe para ${producto.nombre}`,
        });
      }

      const precioUnitario = redondear2(listaElegida.precio);
      const subtotal = redondear2(precioUnitario * cantidad);
      total = redondear2(total + subtotal);

      snapshotItems.push({
        producto: producto._id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        lista: listaElegida.nombre,
        precioUnitario,
        cantidad,
        subtotal,
      });

      console.log("✅ 18 - Item agregado al pedido");
    }

    console.log("💰 19 - Total calculado:", total);

    if (total <= 0) {
      console.log("⛔ 20 - Total inválido");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Total inválido" });
    }

    const pedido = new Pedido({
      vendedor,
      cliente: cliente._id,
      items: snapshotItems,
      total,
      observaciones,
      estado: "PENDIENTE",
    });

    console.log("📝 21 - Guardando pedido...");

    await pedido.save({ session });

    console.log("💾 22 - Pedido guardado, haciendo commit");

    await session.commitTransaction();
    session.endSession();

    console.log("🎉 23 - Pedido creado correctamente");

    return res.status(201).json({
      msg: "Pedido creado correctamente",
      pedido,
    });
  } catch (error) {
    console.error("💥 ERROR CAPTURADO:");
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    session.endSession();

    return res.status(500).json({
      msg: "Error al crear el pedido",
      error: error.message,
    });
  }
};

export { crearPedido };