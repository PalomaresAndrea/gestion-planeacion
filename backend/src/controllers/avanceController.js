import Avance from '../models/Avance.js';
import notificacionService from '../services/notificacionService.js';
import Profesor from '../models/Profesor.js';

/**
 * 📘 Crear avance
 */
export const crearAvance = async (req, res) => {
  try {
    console.log('📝 Creando avance con datos:', JSON.stringify(req.body, null, 2));

    const { materia, parcial } = req.body;
    if (!materia || !parcial) {
      return res.status(400).json({
        message: 'Campos requeridos faltantes',
        required: ['materia', 'parcial'],
        received: { materia, parcial }
      });
    }

    if (req.usuario.rol === 'profesor') {
      const perfilProfesor = await Profesor.findOne({ usuario: req.usuario._id });
      if (!perfilProfesor) {
        return res.status(404).json({ message: 'Perfil de profesor no encontrado' });
      }
      req.body.usuario_id = req.usuario._id;
      req.body.profesor = req.usuario.nombre;
    }

    const temasPlaneados = req.body.temasPlaneados || [];
    const temasCubiertos = req.body.temasCubiertos || [];
    let porcentajeCalculado = 0;

    if (temasPlaneados.length > 0) {
      porcentajeCalculado = Math.round((temasCubiertos.length / temasPlaneados.length) * 100);
    }

    const currentYear = new Date().getFullYear();
    const cicloEscolar = `${currentYear}-${currentYear + 1}`;

    const datosAvance = {
      ...req.body,
      porcentajeAvance: req.body.porcentajeAvance || porcentajeCalculado,
      cicloEscolar,
      temasPlaneados,
      temasCubiertos,
      actividadesRealizadas: req.body.actividadesRealizadas || [],
      dificultades: req.body.dificultades || '',
      observaciones: req.body.observaciones || '',
      estadoAprobacion: 'pendiente',
      aprobado: false
    };

    console.log('📦 Creando nuevo documento Avance con datos:', datosAvance);
    const nuevo = new Avance(datosAvance);

    console.log('💿 Guardando en base de datos...');
    await nuevo.save();
    console.log('✅ Avance guardado exitosamente');

    res.status(201).json({
      message: 'Avance creado correctamente',
      data: nuevo
    });
  } catch (error) {
    console.error('❌ ERROR en crearAvance:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: 'Error de validación',
        errors
      });
    }

    res.status(500).json({
      message: 'Error interno al crear avance',
      error: error.message
    });
  }
};

/**
 * 📋 Obtener todos los avances (con filtros)
 */
export const obtenerAvances = async (req, res) => {
  try {
    const { profesor, materia, parcial, cumplimiento, ciclo, estadoAprobacion } = req.query;
    const filtro = {};

    if (req.usuario.rol === 'profesor') filtro.usuario_id = req.usuario._id;
    if (profesor) filtro.profesor = profesor;
    if (materia) filtro.materia = materia;
    if (parcial) filtro.parcial = parseInt(parcial);
    if (cumplimiento) filtro.cumplimiento = cumplimiento;
    if (ciclo) filtro.cicloEscolar = ciclo;
    if (estadoAprobacion) filtro.estadoAprobacion = estadoAprobacion;

    console.log('🔍 Buscando avances con filtro:', filtro);
    const avances = await Avance.find(filtro).sort({ fechaRegistro: -1 });
    console.log(`📊 Encontrados ${avances.length} avances`);

    res.json(avances);
  } catch (error) {
    console.error('❌ Error obteniendo avances:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔍 Obtener avance por ID
 */
export const obtenerAvancePorId = async (req, res) => {
  try {
    const avance = await Avance.findById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: 'Avance no encontrado' });
    }

    if (req.usuario.rol === 'profesor' && avance.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para ver este avance' });
    }

    res.json(avance);
  } catch (error) {
    console.error('❌ Error obteniendo avance por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✏️ Actualizar avance por ID
 */
export const actualizarAvance = async (req, res) => {
  try {
    const avance = await Avance.findById(req.params.id);
    if (!avance) return res.status(404).json({ message: 'Avance no encontrado' });

    if (req.usuario.rol === 'profesor' && avance.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este avance' });
    }

    const datosActualizacion = {
      ...req.body,
      estadoAprobacion: 'pendiente',
      aprobado: false,
      comentariosAprobacion: '',
      revisadoPor: '',
      fechaRevision: null
    };

    const actualizado = await Avance.findByIdAndUpdate(
      req.params.id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    res.json(actualizado);
  } catch (error) {
    console.error('❌ Error actualizando avance:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Aprobar o rechazar evidencia
 */
export const aprobarEvidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado, comentarios, revisadoPor } = req.body;

    if (typeof aprobado !== 'boolean') {
      return res.status(400).json({
        message: 'El campo "aprobado" es requerido y debe ser booleano'
      });
    }

    if (!['coordinador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({
        message: 'No tienes permisos para aprobar evidencias'
      });
    }

    const avance = await Avance.findById(id);
    if (!avance) return res.status(404).json({ message: 'Avance no encontrado' });

    avance.estadoAprobacion = aprobado ? 'aprobado' : 'rechazado';
    avance.aprobado = aprobado;
    avance.comentariosAprobacion = comentarios || '';
    avance.revisadoPor = revisadoPor || req.usuario.nombre;
    avance.fechaRevision = new Date();

    await avance.save();

    res.json({
      message: aprobado
        ? 'Evidencia aprobada exitosamente.'
        : 'Evidencia rechazada.',
      data: avance
    });
  } catch (error) {
    console.error('❌ Error al aprobar evidencia:', error);
    res.status(500).json({
      message: 'Error interno del servidor al procesar la aprobación',
      error: error.message
    });
  }
};

/**
 * 🗑️ Eliminar avance
 */
export const eliminarAvance = async (req, res) => {
  try {
    const avance = await Avance.findById(req.params.id);
    if (!avance) return res.status(404).json({ message: 'Avance no encontrado' });

    if (req.usuario.rol === 'profesor' && avance.usuario_id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este avance' });
    }

    await Avance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Avance eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando avance:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📧 Enviar recordatorios (solo coordinadores/admin)
 */
export const enviarRecordatorios = async (req, res) => {
  try {
    if (!['coordinador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para enviar recordatorios' });
    }

    const currentYear = new Date().getFullYear();
    const cicloFiltro = req.body.ciclo || `${currentYear}-${currentYear + 1}`;

    const avancesPendientes = await Avance.aggregate([
      {
        $match: {
          cicloEscolar: cicloFiltro,
          cumplimiento: { $in: ['parcial', 'no cumplido'] }
        }
      },
      {
        $group: {
          _id: '$profesor',
          pendientes: {
            $push: {
              materia: '$materia',
              parcial: '$parcial',
              porcentaje: '$porcentajeAvance',
              cumplimiento: '$cumplimiento'
            }
          }
        }
      }
    ]);

    let resultados = [];
    let emailsEnviados = 0;

    for (const profesorData of avancesPendientes) {
      const profesorEmail = 'palomaresschoenstantt@gmail.com';
      const resultado = await notificacionService.enviarRecordatorioAvance(
        profesorData._id,
        profesorEmail,
        profesorData.pendientes
      );

      if (resultado.success) emailsEnviados++;

      resultados.push({
        profesor: profesorData._id,
        email: profesorEmail,
        pendientes: profesorData.pendientes.length,
        envioExitoso: resultado.success,
        error: resultado.error
      });
    }

    res.json({
      message: `Recordatorios enviados a ${emailsEnviados} de ${avancesPendientes.length} profesores`,
      totalProfesores: avancesPendientes.length,
      emailsEnviados,
      resultados
    });
  } catch (error) {
    console.error('❌ Error en enviarRecordatorios:', error);
    res.status(500).json({
      message: 'Error enviando recordatorios',
      error: error.message
    });
  }
};

/**
 * 📈 Estadísticas por profesor
 */
export const obtenerEstadisticasProfesor = async (req, res) => {
  try {
    const { profesor, ciclo } = req.query;
    const filtro = {};

    if (req.usuario.rol === 'profesor') {
      filtro.usuario_id = req.usuario._id;
    } else if (profesor) {
      filtro.profesor = profesor;
    } else {
      return res.status(400).json({ message: 'Se requiere el parámetro profesor' });
    }

    if (ciclo) filtro.cicloEscolar = ciclo;

    const avances = await Avance.find(filtro);

    const estadisticas = {
      total: avances.length,
      cumplido: avances.filter(a => a.cumplimiento === 'cumplido').length,
      parcial: avances.filter(a => a.cumplimiento === 'parcial').length,
      noCumplido: avances.filter(a => a.cumplimiento === 'no cumplido').length,
      promedioPorcentaje: avances.length
        ? (avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length).toFixed(2)
        : 0,
      aprobacion: {
        pendiente: avances.filter(a => a.estadoAprobacion === 'pendiente').length,
        aprobado: avances.filter(a => a.estadoAprobacion === 'aprobado').length,
        rechazado: avances.filter(a => a.estadoAprobacion === 'rechazado').length
      }
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📊 Reporte general (solo coordinadores/admin)
 */
export const obtenerReporteGeneral = async (req, res) => {
  try {
    if (!['coordinador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para ver reportes generales' });
    }

    const { ciclo } = req.query;
    const filtro = ciclo ? { cicloEscolar: ciclo } : {};

    const avances = await Avance.find(filtro);

    const reporte = {
      totalAvances: avances.length,
      cumplimientoGeneral: {
        cumplido: avances.filter(a => a.cumplimiento === 'cumplido').length,
        parcial: avances.filter(a => a.cumplimiento === 'parcial').length,
        noCumplido: avances.filter(a => a.cumplimiento === 'no cumplido').length
      },
      aprobacionGeneral: {
        pendiente: avances.filter(a => a.estadoAprobacion === 'pendiente').length,
        aprobado: avances.filter(a => a.estadoAprobacion === 'aprobado').length,
        rechazado: avances.filter(a => a.estadoAprobacion === 'rechazado').length
      },
      promedioGlobal: avances.length
        ? (avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length).toFixed(2)
        : 0
    };

    res.json(reporte);
  } catch (error) {
    console.error('❌ Error generando reporte general:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📉 Datos para gráficas (solo coordinadores/admin)
 */
export const obtenerDatosGraficas = async (req, res) => {
  try {
    if (!['coordinador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para ver gráficas' });
    }

    const { ciclo } = req.query;
    const filtro = ciclo ? { cicloEscolar: ciclo } : {};

    const avances = await Avance.find(filtro);

    const datos = {
      cumplimiento: {
        labels: ['Cumplido', 'Parcial', 'No Cumplido'],
        data: [
          avances.filter(a => a.cumplimiento === 'cumplido').length,
          avances.filter(a => a.cumplimiento === 'parcial').length,
          avances.filter(a => a.cumplimiento === 'no cumplido').length
        ]
      },
      aprobacion: {
        labels: ['Pendiente', 'Aprobado', 'Rechazado'],
        data: [
          avances.filter(a => a.estadoAprobacion === 'pendiente').length,
          avances.filter(a => a.estadoAprobacion === 'aprobado').length,
          avances.filter(a => a.estadoAprobacion === 'rechazado').length
        ]
      },
      porParcial: {
        labels: ['Parcial 1', 'Parcial 2', 'Parcial 3'],
        data: [
          avances.filter(a => a.parcial === 1).length,
          avances.filter(a => a.parcial === 2).length,
          avances.filter(a => a.parcial === 3).length
        ]
      },
      porcentajePromedio: avances.length
        ? Math.round(avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length)
        : 0
    };

    res.json(datos);
  } catch (error) {
    console.error('❌ Error obteniendo datos para gráficas:', error);
    res.status(500).json({ message: error.message });
  }
};
