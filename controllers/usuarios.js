import { request, response } from "express";
import Usuario from "../models/usuario.js";
import bcrypt from "bcryptjs";
// import { validationResult } from "express-validator";

const getUsers = async (req = request, res = response) => {
  try {
    const usuarios = await Usuario.find({ estado: true });
    const total = await Usuario.countDocuments();
    return res.json({ total, usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res
      .status(500)
      .json({ msg: "Error al obtener usuarios", error: error.message });
  }
};

//obtener usuario por id
const getUser = async (req, res = response) => {
   const usuarioAuth = req.usuario;
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res
        .status(404)
        .json({ msg: `Usuario con id ${id} no encontrado` });
    }
        if (
      usuarioAuth.rol !== "ADMIN_ROLE" &&  
      usuarioAuth._id.toString() !== id
    ) {
      return res.status(403).json({
        msg: "No tenés permisos para ver este usuario",
      });
    }

    return res.json({ usuario });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res
      .status(500)
      .json({ msg: "Error al obtener usuario", error: error.message });
  }
};

const postUsers = async (req, res = response) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const usuario = new Usuario({ nombre, email, password, rol });

    // Hash contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();

    return res.status(201).json({ msg: "Usuario creado con éxito!", usuario });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res
      .status(500)
      .json({ msg: "Error al crear usuario", error: error.message });
  }
};

const putUsers = async (req, res) => {
  const { id } = req.params;
  const { password, _id, email, ...resto } = req.body; // Excluimos campos no editables

  try {
    // Buscamos al usuario en la base de datos
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        message: `Usuario con id ${id} no encontrado`,
      });
    }

    // Si el usuario está inactivo, lo reactivamos
    if (!usuario.estado) {
      resto.estado = true; // Cambiamos el estado a activo
    }

    // Si se envía una nueva contraseña, la encriptamos
    if (password) {
      const salt = bcrypt.genSaltSync();
      resto.password = bcrypt.hashSync(password, salt);
    }

    // Actualizamos el usuario, incluyendo el estado si fue modificado
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { ...resto },
      { new: true },
    );

    res.status(200).json({
      message: "Usuario actualizado",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({
      message: "Hubo un error al actualizar el usuario",
    });

    return res.status(500).json({
      message: "Hubo un error al actualizar el usuario",
      error: error.message,
    });
  }
};

const deleteUsers = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    // Inactivar usuario
    const usuarioBorrado = await Usuario.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    if (!usuarioBorrado) {
      return res
        .status(404)
        .json({ msg: `Usuario con id ${id} no encontrado` });
    }

    return res.json({ message: "Usuario eliminado", usuarioBorrado });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res
      .status(500)
      .json({ msg: "Error al eliminar usuario", error: error.message });
  }
};

export { getUsers, postUsers, putUsers, deleteUsers, getUser };
