const esMismoUsuarioOAdmin = (req, res, next) => {
  const { id } = req.params;
  const usuarioAuth = req.usuario;

  if (
    usuarioAuth._id.toString() !== id &&
    usuarioAuth.rol !== "ADMIN"
  ) {
    return res.status(403).json({
      msg: "No tiene permisos para realizar esta acción",
    });
  }

  next();
};

export { esMismoUsuarioOAdmin };
