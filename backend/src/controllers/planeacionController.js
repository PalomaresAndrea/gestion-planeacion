import Planeacion from '../models/Planeacion.js';

// Crear nueva planeación
export const crearPlaneacion = async (req, res) => {
  try {
    const nueva = new Planeacion(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las planeaciones (con filtros opcionales)
export const obtenerPlaneaciones = async (req, res) => {
  try {
    const { profesor, materia, parcial, estado, ciclo } = req.query;
    const filtro = {};
    
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
    res.json(planeacion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar planeación por ID pal commit que me caga no se suba alv
export const actualizarPlaneacion = async (req, res) => {
  try {
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

// Revisar planeación (para coordinadores)
export const revisarPlaneacion = async (req, res) => {
  try {
    const { estado, observaciones, coordinadorRevisor } = req.body;
    
    const actualizada = await Planeacion.findByIdAndUpdate(
      req.params.id,
      {
        estado,
        observaciones,
        coordinadorRevisor,
        fechaRevision: new Date()
      },
      { new: true }
    );

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

    const historial = await Planeacion.find({
      profesor,
      materia
    }).sort({ cicloEscolar: -1, parcial: 1 });

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
    
    const planeaciones = await Planeacion.find({ 
      cicloEscolar: cicloActual 
    }).sort({ fechaSubida: -1 });

    res.json(planeaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};