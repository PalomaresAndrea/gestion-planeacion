export const autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        message: 'Acceso denegado. Se requiere autenticación.'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        message: 'Acceso denegado. No tienes permisos suficientes.'
      });
    }

    next();
  };
};

// Middleware específico para recursos del profesor
export const soloPropiosRecursos = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      message: 'Acceso denegado. Se requiere autenticación.'
    });
  }

  // Admin y coordinadores pueden ver todo
  if (req.usuario.rol === 'admin' || req.usuario.rol === 'coordinador') {
    return next();
  }

  // Profesores solo pueden acceder a sus propios recursos
  // Esto se aplicará en los controllers específicamente
  next();
};