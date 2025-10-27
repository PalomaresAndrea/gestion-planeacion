import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const autenticar = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        message: 'Acceso denegado. No hay token proporcionado.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_backup');
    
    // Buscar usuario
    const usuario = await Usuario.findById(decoded.id).select('-password');
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        message: 'Token inválido o usuario inactivo.'
      });
    }

    // Agregar usuario al request
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({
      message: 'Token inválido.'
    });
  }
};

// Middleware opcional (no bloquea si no hay token)
export const autenticarOpcional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_backup');
      const usuario = await Usuario.findById(decoded.id).select('-password');
      if (usuario && usuario.activo) {
        req.usuario = usuario;
      }
    }
    next();
  } catch (error) {
    next(); // Continuar sin autenticación
  }
};