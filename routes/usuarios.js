import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { esAdminRole } from "../middlewares/validar-roles.js";
import {
  getUsers,
  postUsers,
  putUsers,
  deleteUsers,
  getUser,
} from "../controllers/usuarios.js";
import {
  emailExiste,
  existeUsuarioPorId,
  rolValido,
} from "../helpers/db-validators.js";

const router = Router();

router.get("/", [validarJWT, esAdminRole], getUsers);

router.get(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    validarCampos,
  ],
  getUser,
);

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check(
      "password",
      "La contraseña debe tener mínimo 8 caracteres,mayusculas,minusculas,numeros y simbolos especiales",
    ).matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ),
    check("email", "El email no es valido").isEmail(),
    check("email").custom(emailExiste),
    check("rol").custom(rolValido),
    validarCampos,
  ],
  postUsers,
);

router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un id válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    validarCampos,
  ],
  putUsers,
);

router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un id válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    validarCampos,
  ],
  deleteUsers,
);

export default router;
