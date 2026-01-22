import { Router } from "express";
import { check } from "express-validator";

import { cancelarPedido } from "../controllers/cancelarPedido.js";
import { crearPedido, obtenerPedidosAdmin, obtenerPedidosVendedor } from "../controllers/pedidos.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { esAdminRole } from "../middlewares/validar-roles.js";


const routerPedido = Router();

routerPedido.get("/", [validarJWT, esAdminRole], obtenerPedidosAdmin );

routerPedido.get("/mis-pedidos", validarJWT, obtenerPedidosVendedor);

routerPedido.post("/", [validarJWT, validarCampos], crearPedido);

routerPedido.put("/:id/cancelar", [validarJWT, esAdminRole],cancelarPedido );

export default routerPedido;
