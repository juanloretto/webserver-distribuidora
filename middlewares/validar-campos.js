import { validationResult } from "express-validator"; 

//validar errores
const validarCampos = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errores: errors.array().map(err => ({
        campo: err.param,
        msg: err.msg
      }))
    });
  }
  next();
};


export {validarCampos}