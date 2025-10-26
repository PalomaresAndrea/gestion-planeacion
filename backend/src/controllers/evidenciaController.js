import Evidencia from '../models/Evidencia.js';
import notificacionService from '../services/notificacionService.js';

// Crear evidencia
export const crearEvidencia = async (req, res) => {
  try {
    const nueva = new Evidencia(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las evidencias (con filtros)
export const obtenerEvidencias = async (req, res) => {
  try {
    const { profesor, estado, tipo, ciclo, institucion } = req.query;
    const filtro = {};
    
    if (profesor) filtro.profesor = profesor;
    if (estado) filtro.estado = estado;
    if (tipo) filtro.tipoCapacitacion = tipo;
    if (ciclo) filtro.cicloEscolar = ciclo;
    if (institucion) filtro.institucion = new RegExp(institucion, 'i');

    const evidencias = await Evidencia.find(filtro).sort({ fechaSubida: -1 });
    res.json(evidencias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener evidencia por ID
export const obtenerEvidenciaPorId = async (req, res) => {
  try {
    const evidencia = await Evidencia.findById(req.params.id);
    if (!evidencia) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }
    res.json(evidencia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar evidencia
export const actualizarEvidencia = async (req, res) => {
  try {
    const actualizada = await Evidencia.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar evidencia
export const eliminarEvidencia = async (req, res) => {
  try {
    await Evidencia.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evidencia eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validar/Rechazar evidencia (para coordinadores) - CON NOTIFICACIÓN
export const validarEvidencia = async (req, res) => {
  try {
    const { estado, observaciones, coordinadorValidador } = req.body;
    
    if (!['validada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado debe ser "validada" o "rechazada"' });
    }

    const actualizada = await Evidencia.findByIdAndUpdate(
      req.params.id,
      {
        estado,
        observaciones,
        coordinadorValidador,
        fechaValidacion: new Date()
      },
      { new: true }
    );

    // 📧 ENVIAR NOTIFICACIÓN POR EMAIL
    try {
      await notificacionService.notificarValidacionEvidencia(
        actualizada,
        estado,
        observaciones
      );
      console.log(`📧 Notificación de evidencia ${estado} enviada`);
    } catch (emailError) {
      console.error('Error enviando notificación de evidencia:', emailError);
      // No fallar la operación principal si falla el email
    }

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener estadísticas de evidencias por profesor
export const obtenerEstadisticasProfesor = async (req, res) => {
  try {
    const { profesor, ciclo } = req.query;
    
    if (!profesor) {
      return res.status(400).json({ message: 'Se requiere el parámetro profesor' });
    }

    const filtro = { profesor };
    if (ciclo) filtro.cicloEscolar = ciclo;

    const evidencias = await Evidencia.find(filtro);
    
    const estadisticas = {
      total: evidencias.length,
      validadas: evidencias.filter(e => e.estado === 'validada').length,
      pendientes: evidencias.filter(e => e.estado === 'pendiente').length,
      rechazadas: evidencias.filter(e => e.estado === 'rechazada').length,
      totalHoras: evidencias.reduce((acc, curr) => acc + curr.horasAcreditadas, 0),
      porTipo: {},
      porInstitucion: {}
    };

    // Agrupar por tipo de capacitación
    evidencias.forEach(evidencia => {
      if (!estadisticas.porTipo[evidencia.tipoCapacitacion]) {
        estadisticas.porTipo[evidencia.tipoCapacitacion] = 0;
      }
      estadisticas.porTipo[evidencia.tipoCapacitacion]++;
    });

    // Agrupar por institución
    evidencias.forEach(evidencia => {
      if (!estadisticas.porInstitucion[evidencia.institucion]) {
        estadisticas.porInstitucion[evidencia.institucion] = 0;
      }
      estadisticas.porInstitucion[evidencia.institucion]++;
    });

    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reporte general de evidencias
export const obtenerReporteGeneral = async (req, res) => {
  try {
    const { ciclo } = req.query;
    const filtro = ciclo ? { cicloEscolar: ciclo } : {};

    const evidencias = await Evidencia.find(filtro);
    
    const reporte = {
      totalEvidencias: evidencias.length,
      estadoGeneral: {
        validadas: evidencias.filter(e => e.estado === 'validada').length,
        pendientes: evidencias.filter(e => e.estado === 'pendiente').length,
        rechazadas: evidencias.filter(e => e.estado === 'rechazada').length
      },
      totalHorasAcreditadas: evidencias.reduce((acc, curr) => acc + curr.horasAcreditadas, 0),
      porProfesor: {},
      porTipo: {},
      porInstitucion: {}
    };

    // Agrupar por profesor
    evidencias.forEach(evidencia => {
      if (!reporte.porProfesor[evidencia.profesor]) {
        reporte.porProfesor[evidencia.profesor] = {
          total: 0,
          validadas: 0,
          pendientes: 0,
          rechazadas: 0,
          horasTotales: 0
        };
      }
      reporte.porProfesor[evidencia.profesor].total++;
      reporte.porProfesor[evidencia.profesor][evidencia.estado]++;
      reporte.porProfesor[evidencia.profesor].horasTotales += evidencia.horasAcreditadas;
    });

    // Agrupar por tipo
    evidencias.forEach(evidencia => {
      if (!reporte.porTipo[evidencia.tipoCapacitacion]) {
        reporte.porTipo[evidencia.tipoCapacitacion] = 0;
      }
      reporte.porTipo[evidencia.tipoCapacitacion]++;
    });

    // Agrupar por institución
    evidencias.forEach(evidencia => {
      if (!reporte.porInstitucion[evidencia.institucion]) {
        reporte.porInstitucion[evidencia.institucion] = 0;
      }
      reporte.porInstitucion[evidencia.institucion]++;
    });

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar evidencias por nombre de curso o institución
export const buscarEvidencias = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Se requiere el parámetro de búsqueda (q)' });
    }

    const evidencias = await Evidencia.find({
      $or: [
        { nombreCurso: new RegExp(q, 'i') },
        { institucion: new RegExp(q, 'i') },
        { profesor: new RegExp(q, 'i') }
      ]
    }).sort({ fechaSubida: -1 });

    res.json(evidencias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};