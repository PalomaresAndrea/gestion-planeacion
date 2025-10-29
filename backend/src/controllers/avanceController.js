// Importar modelo Avance
import Avance from '../models/Avance.js';

/**
 * Crear un nuevo avance
 */
export const crearAvance = async (req, res) => {
  try {
    // Validar campos obligatorios
    if (!req.body.profesor || !req.body.materia) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: profesor o materia' });
    }

    const nuevoAvance = new Avance(req.body);
    await nuevoAvance.save();
    res.status(201).json(nuevoAvance);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener todos los avances con filtros opcionales
 */
export const obtenerAvances = async (req, res) => {
  try {
    const { profesor, materia, parcial, cumplimiento, ciclo } = req.query;
    const filtro = {};

    if (profesor) filtro.profesor = profesor;
    if (materia) filtro.materia = materia;
    if (parcial) filtro.parcial = parseInt(parcial);
    if (cumplimiento) filtro.cumplimiento = cumplimiento;
    if (ciclo) filtro.cicloEscolar = ciclo;

    const avances = await Avance.find(filtro).sort({ fechaRegistro: -1 });
    res.json(avances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener un avance por ID
 */
export const obtenerAvancePorId = async (req, res) => {
  try {
    const avanceEncontrado = await Avance.findById(req.params.id);
    if (!avanceEncontrado) {
      return res.status(404).json({ message: 'Avance no encontrado' });
    }
    res.json(avanceEncontrado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Actualizar un avance por ID
 */
export const actualizarAvance = async (req, res) => {
  try {
    const avanceActualizado = await Avance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(avanceActualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Eliminar un avance por ID
 */
export const eliminarAvance = async (req, res) => {
  try {
    await Avance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Avance eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener estadísticas de cumplimiento por profesor
 */
export const obtenerEstadisticasProfesor = async (req, res) => {
  try {
    const { profesor, ciclo } = req.query;
    const filtro = { profesor };
    if (ciclo) filtro.cicloEscolar = ciclo;

    const avances = await Avance.find(filtro);

    const estadisticas = {
      total: avances.length,
      cumplido: avances.filter(a => a.cumplimiento === 'cumplido').length,
      parcial: avances.filter(a => a.cumplimiento === 'parcial').length,
      noCumplido: avances.filter(a => a.cumplimiento === 'no cumplido').length,
      promedioPorcentaje: avances.length 
        ? avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length 
        : 0,
      porMateria: {},
      porParcial: {
        1: avances.filter(a => a.parcial === 1),
        2: avances.filter(a => a.parcial === 2),
        3: avances.filter(a => a.parcial === 3)
      }
    };

    // Agrupar por materia
    avances.forEach(avance => {
      if (!estadisticas.porMateria[avance.materia]) {
        estadisticas.porMateria[avance.materia] = [];
      }
      estadisticas.porMateria[avance.materia].push(avance);
    });

    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reporte general de cumplimiento
 */
export const obtenerReporteGeneral = async (req, res) => {
  try {
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
      porProfesor: {},
      porMateria: {},
      porParcial: {
        1: avances.filter(a => a.parcial === 1),
        2: avances.filter(a => a.parcial === 2),
        3: avances.filter(a => a.parcial === 3)
      },
      promedioGlobal: avances.length 
        ? avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length 
        : 0
    };

    // Agrupar por profesor
    avances.forEach(avance => {
      if (!reporte.porProfesor[avance.profesor]) {
        reporte.porProfesor[avance.profesor] = {
          total: 0,
          cumplido: 0,
          parcial: 0,
          noCumplido: 0,
          promedioPorcentaje: 0
        };
      }
      reporte.porProfesor[avance.profesor].total++;
      reporte.porProfesor[avance.profesor][avance.cumplimiento]++;
    });

    // Calcular promedio por profesor
    Object.keys(reporte.porProfesor).forEach(profesor => {
      const profAvances = avances.filter(a => a.profesor === profesor);
      reporte.porProfesor[profesor].promedioPorcentaje = profAvances.length
        ? profAvances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / profAvances.length
        : 0;
    });

    // Agrupar por materia
    avances.forEach(avance => {
      if (!reporte.porMateria[avance.materia]) {
        reporte.porMateria[avance.materia] = {
          total: 0,
          cumplido: 0,
          parcial: 0,
          noCumplido: 0
        };
      }
      reporte.porMateria[avance.materia].total++;
      reporte.porMateria[avance.materia][avance.cumplimiento]++;
    });

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Datos para gráficas
 */
export const obtenerDatosGraficas = async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
};
