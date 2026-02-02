import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { login } from "../controllers/auth.js";

//creamos una instancia de router
const routerAuth = Router();

routerAuth.post(
  "/login",
  [
    check("email", "El correo es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
    validarCampos,
  ],
  login,
);

export default routerAuth;
