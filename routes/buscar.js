import { Router } from "express";
import { validarJWT } from "../middlewares/validar-jwt.js";
import buscarProducto from "../controllers/buscarProducto.js";
import buscarCliente from "../controllers/buscarCliente.js";
import buscarCategoria from "../controllers/buscarCategoria.js";

const router = Router();

router.use(validarJWT);

// 🔍 Búsquedas
router.get("/productos/:termino", buscarProducto);
router.get("/clientes/:termino", buscarCliente);
router.get("/categorias/:termino", buscarCategoria);

export default router;
