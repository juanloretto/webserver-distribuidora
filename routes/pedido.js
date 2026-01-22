import { Router } from "express";
import { check } from "express-validator";

import { cancelarPedido } from "../controllers/cancelarPedido.js";
import {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
} from "../controllers/pedidos.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { esAdminRole } from "../middlewares/validar-roles.js";
const routerPedido = Router();

routerPedido.get("/", validarJWT, obtenerPedidos);

routerPedido.get("/:id", validarJWT, obtenerPedidoPorId);

routerPedido.post("/", [validarJWT, validarCampos], crearPedido);

routerPedido.put("/:id", [validarJWT, validarCampos], actualizarPedido);

routerPedido.delete("/:id", [validarJWT, esAdminRole], eliminarPedido);

export default routerPedido;
