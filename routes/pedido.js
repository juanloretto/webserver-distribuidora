import { Router } from "express";
import exportarPedidosExcel from "../controllers/exportarPedidosExcel.js";
import { metricasPedidos } from "../controllers/metricasPedido.js";
import { cambiarEstadoPedido } from "../controllers/cambiarEstadoPedido.js";
import { cancelarPedido } from "../controllers/cancelarPedido.js";
import {
  crearPedido,
  obtenerPedidosAdmin,
  obtenerPedidosVendedor,
} from "../controllers/pedidos.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { esAdminRole } from "../middlewares/validar-roles.js";

const routerPedido = Router();

routerPedido.get("/test", (req, res) => {
  res.json({ ok: true });
});
routerPedido.get("/exportar/excel/:id", [validarJWT, esAdminRole], exportarPedidosExcel);

routerPedido.get("/", [validarJWT, esAdminRole], obtenerPedidosAdmin);

routerPedido.get("/vendedor", validarJWT, obtenerPedidosVendedor);

routerPedido.post("/", [validarJWT, validarCampos], crearPedido);

routerPedido.put("/:id/cancelar", validarJWT, cancelarPedido);

routerPedido.put("/:id/estado", validarJWT, cambiarEstadoPedido);

routerPedido.get("/metricas", [validarJWT, esAdminRole], metricasPedidos);


export default routerPedido;
