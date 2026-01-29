import { ROLES } from "../helpers/roles-def.js";

const esAdminRole = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      msg: "No autenticado",
    });
  }

  const { rol, nombre } = req.usuario;

  if (rol !== ROLES.ADMIN) {
    return res.status(403).json({
      msg: `${nombre} no es un administrador`,
    });
  }

  next();
};

export { esAdminRole };
