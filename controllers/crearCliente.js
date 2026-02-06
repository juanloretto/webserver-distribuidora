import Cliente from "../models/cliente.js";

export const crearCliente = async (req, res) => {
  try {
    const vendedor = req.usuario; // viene del middleware JWT
    const { nombre, direccion, telefono } = req.body;

    if (!vendedor) {
      return res.status(401).json({
        msg: "Usuario no autenticado",
      });
    }

    // 1️⃣ Validación mínima
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({
        msg: "El nombre del cliente es obligatorio",
      });
    }

    // 2️⃣ Evitar duplicados por vendedor
    const clienteExistente = await Cliente.findOne({
      nombre: nombre.trim(),
      vendedor,
      estado: true,
    });

    if (clienteExistente) {
      return res.status(409).json({
        msg: "Ya existe un cliente con ese nombre",
        cliente: clienteExistente,
      });
    }

    // 3️⃣ Crear cliente
    const cliente = new Cliente({
      nombre: nombre.trim(),
      direccion,
      telefono,
      vendedor,
    });

    await cliente.save();

    res.status(201).json({
      msg: "Cliente creado correctamente",
      cliente,
    });
  } catch (error) {
    console.error("❌ Error al crear cliente:", error);

    res.status(500).json({
      msg: "Error al crear el cliente",
      error: error.message,
    });
  }
};