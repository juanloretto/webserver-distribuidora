

import { ROLES } from "../helpers/roles-def"

const tieneRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        msg: "No autenticado",
      });
    }

    const { rol, nombre } = req.usuario;

    // Verifica si el rol del usuario está entre los permitidos
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({
        msg: `${nombre} no tiene permisos para esta acción`,
      });
    }

    next();
  };
};

export { tieneRol };
