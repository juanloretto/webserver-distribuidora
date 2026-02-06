import { Router } from "express";
import { crearCliente } from "../controllers/crearCliente.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const routerClientes = Router();

routerClientes.post("/", [validarJWT, validarCampos], crearCliente);

export default routerClientes;