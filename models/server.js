import express from "express";
import cors from "cors";
import router from "../routes/usuarios.js";
import routerAuth from "../routes/auth.js";
import routerCat from "../routes/categorias.js";
import routerProd from "../routes/productos.js";
import routerSearch from "../routes/buscar.js";
import { dbConnection } from "../database/config.js";
import routerPedido from "../routes/pedido.js";
import routerClientes from "../routes/clientes.js";

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.usuarioPath = "/api/usuarios";
    this.authPath = "/api/auth";
    this.categoriaPath = "/api/categorias";
    this.productoPath = "/api/productos";
    this.pedidoPath = "/api/pedidos";
    this.buscarPath = "/api/buscar";
    this.clientePath = "/api/clientes";
    this.conectarDB();
    this.middlewares();
    this.routes();
  }

  async conectarDB() {
    dbConnection();
  }

  routes() {
    this.app.use(this.usuarioPath, router);
    this.app.use(this.authPath, routerAuth);
    this.app.use(this.categoriaPath, routerCat);
    this.app.use(this.productoPath, routerProd);
    this.app.use(this.buscarPath, routerSearch);
    this.app.use(this.pedidoPath, routerPedido);
    this.app.use(this.clientePath, routerClientes);
  }
  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }
  listen() {
    this.app.listen(this.port, () => {
      console.log("server online, port: ", this.port);
    });
  }
}

export default Server;
