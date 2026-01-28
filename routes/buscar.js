import { Router } from "express";
import buscar from "../controllers/buscarProducto.js";
 
const routerSearch = Router();

//{{url}}/api/productos/cafe

routerSearch.get("/:coleccion/:termino", buscar);

export default routerSearch;