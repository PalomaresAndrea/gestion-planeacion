import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const autenticar = async (req, res, next) => {
  try {
    let token;

    // Verificar si el token está en el header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'No autorizado, token no proporcionado'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_backup');
      
      // Obtener usuario del token
      const usuario = await Usuario.findById(decoded.id).select('-password');
      
      if (!usuario || !usuario.activo) {
        return res.status(401).json({
          message: 'Token inválido, usuario no existe o está inactivo'
        });
      }

      req.usuario = usuario;
      next();
    } catch (error) {
      console.error('Error verificando token:', error);
      return res.status(401).json({
        message: 'Token inválido'
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      message: 'Error del servidor en autenticación'
    });
  }
};

// Middleware para verificar si es administrador
export const esAdmin = (req, res, next) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }
    next();
  } catch (error) {
    console.error('Error en middleware esAdmin:', error);
    res.status(500).json({
      message: 'Error del servidor en verificación de permisos'
    });
  }
};

// Middleware para verificar si es coordinador o admin
export const esCoordinadorOAdmin = (req, res, next) => {
  try {
    if (!['coordinador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({
        message: 'Acceso denegado. Se requieren permisos de coordinador o administrador.'
      });
    }
    next();
  } catch (error) {
    console.error('Error en middleware esCoordinadorOAdmin:', error);
    res.status(500).json({
      message: 'Error del servidor en verificación de permisos'
    });
  }
};