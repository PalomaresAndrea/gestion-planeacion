import Planeacion from '../models/Planeacion.js';
import notificacionService from '../services/notificacionService.js';
import Profesor from '../models/Profesor.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/planeaciones';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir PDFs
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

// Crear nueva planeación CON ARCHIVO
export const crearPlaneacion = async (req, res) => {
  try {
    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'Debe subir un archivo PDF' });
    }

    const planeacionData = {
      ...req.body,
      archivo: req.file.filename, // Guardar nombre del archivo
      archivoOriginal: req.file.originalname // Guardar nombre original
    };

    // Para profesores, asignar automáticamente su usuario_id
    if (req.usuario.rol === 'profesor') {
      const perfilProfesor = await Profesor.findOne({ usuario: req.usuario._id });
      if (!perfilProfesor) {
        // Eliminar archivo subido si hay error
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Perfil de profesor no encontrado' });
      }
      planeacionData.usuario_id = req.usuario._id;
      planeacionData.profesor = req.usuario.nombre;
    }

    const nueva = new Planeacion(planeacionData);
    await nueva.save();
    
    res.status(201).json({
      message: 'Planeación creada exitosamente',
      planeacion: nueva
    });
  } catch (error) {
    // Eliminar archivo si hay error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las planeaciones (con filtros opcionales)
export const obtenerPlaneaciones = async (req, res) => {
  try {
    const { profesor, materia, parcial, estado, ciclo } = req.query;
    const filtro = {};
    
    // Si es profesor, solo puede ver sus propias planeaciones
    if (req.usuario.rol === 'profesor') {
      filtro.usuario_id = req.usuario._id;
    }
    
    if (profesor) filtro.profesor = profesor;
    if (materia) filtro.materia = materia;
    if (parcial) filtro.parcial = parcial;
    if (estado) filtro.estado = estado;
    if (ciclo) filtro.cicloEscolar = ciclo;

    const planeaciones = await Planeacion.find(filtro).sort({ fechaSubida: -1 });
    res.json(planeaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener planeación por ID
export const obtenerPlaneacionPorId = async (req, res) => {
  try {
    const planeacion = await Planeacion.findById(req.params.id);
    if (!planeacion) {
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Verificar permisos: profesores solo pueden ver sus propias planeaciones
    if (req.usuario.rol === 'profesor' && planeacion.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para ver esta planeación' });
    }

    res.json(planeacion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar planeación por ID
export const actualizarPlaneacion = async (req, res) => {
  try {
    const planeacion = await Planeacion.findById(req.params.id);
    if (!planeacion) {
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Verificar permisos: profesores solo pueden actualizar sus propias planeaciones
    if (req.usuario.rol === 'profesor' && planeacion.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar esta planeación' });
    }

    const actualizada = await Planeacion.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Revisar planeación (SOLO coordinadores y admin) - CON NOTIFICACIÓN
export const revisarPlaneacion = async (req, res) => {
  try {
    const { estado, observaciones } = req.body;
    
    // Solo coordinadores y admin pueden revisar
    if (!['coordinador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para revisar planeaciones' });
    }

    const actualizada = await Planeacion.findByIdAndUpdate(
      req.params.id,
      {
        estado,
        observaciones,
        coordinadorRevisor: req.usuario.nombre,
        fechaRevision: new Date()
      },
      { new: true }
    );

    // 📧 ENVIAR NOTIFICACIÓN POR EMAIL
    if (estado === 'aprobado' || estado === 'rechazado' || estado === 'ajustes_solicitados') {
      try {
        await notificacionService.notificarRevisionPlaneacion(
          actualizada, 
          estado, 
          observaciones
        );
        console.log(`📧 Notificación enviada para planeación ${estado}`);
      } catch (emailError) {
        console.error('Error enviando notificación:', emailError);
        // No fallar la operación principal si falla el email
      }
    }

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener historial de planeaciones por profesor y materia
export const obtenerHistorial = async (req, res) => {
  try {
    const { profesor, materia } = req.query;
    
    if (!profesor || !materia) {
      return res.status(400).json({ 
        message: 'Se requiere profesor y materia para el historial' 
      });
    }

    const filtro = { profesor, materia };

    // Si es profesor, solo puede ver su propio historial
    if (req.usuario.rol === 'profesor') {
      filtro.usuario_id = req.usuario._id;
    }

    const historial = await Planeacion.find(filtro).sort({ cicloEscolar: -1, parcial: 1 });

    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener planeaciones del ciclo actual
export const obtenerPlaneacionesCicloActual = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const cicloActual = `${currentYear}-${currentYear + 1}`;
    
    const filtro = { cicloEscolar: cicloActual };

    // Si es profesor, solo puede ver sus propias planeaciones
    if (req.usuario.rol === 'profesor') {
      filtro.usuario_id = req.usuario._id;
    }
    
    const planeaciones = await Planeacion.find(filtro).sort({ fechaSubida: -1 });

    res.json(planeaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Servir archivos de planeaciones
export const descargarArchivo = async (req, res) => {
  try {
    const planeacion = await Planeacion.findById(req.params.id);
    if (!planeacion) {
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Verificar permisos
    if (req.usuario.rol === 'profesor' && planeacion.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para ver este archivo' });
    }

    const filePath = path.join('uploads/planeaciones', planeacion.archivo);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    // Enviar archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${planeacion.archivoOriginal || planeacion.archivo}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ver archivo en el navegador
export const verArchivo = async (req, res) => {
  try {
    const planeacion = await Planeacion.findById(req.params.id);
    if (!planeacion) {
      return res.status(404).json({ message: 'Planeación no encontrada' });
    }

    // Verificar permisos
    if (req.usuario.rol === 'profesor' && planeacion.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para ver este archivo' });
    }

    const filePath = path.join('uploads/planeaciones', planeacion.archivo);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    // Enviar archivo para visualización en navegador
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${planeacion.archivoOriginal || planeacion.archivo}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};