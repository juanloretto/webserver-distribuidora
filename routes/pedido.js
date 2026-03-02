import { Router } from "express";
import exportarPedidosExcel from "../controllers/exportarPedidosExcel.js";
import { obtenerMisPedidos, obtenerPedidosAdmin } from "../controllers/obtenerPedidos.js";
import { metricasPedidos } from "../controllers/metricasPedido.js";
import { cambiarEstadoPedido } from "../controllers/cambiarEstadoPedido.js";
import { cancelarPedido } from "../controllers/cancelarPedido.js";
import { crearPedido } from "../controllers/pedidos.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { esAdminRole } from "../middlewares/validar-roles.js";

const routerPedido = Router();

routerPedido.get(
  "/exportar/excel/:id",
  [validarJWT, esAdminRole],
  exportarPedidosExcel,
);

routerPedido.get("/admin", [validarJWT, esAdminRole], obtenerPedidosAdmin);

routerPedido.get("/mis-pedidos", validarJWT, obtenerMisPedidos);

routerPedido.post("/", [validarJWT, validarCampos], crearPedido);

routerPedido.put("/:id/cancelar", validarJWT, cancelarPedido);

routerPedido.put("/:id/estado", validarJWT, cambiarEstadoPedido);

routerPedido.get("/metricas", [validarJWT, esAdminRole], metricasPedidos);

export default routerPedido;
