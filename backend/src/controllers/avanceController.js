import Avance from '../models/Avance.js';

//  Crear avance
export const crearAvance = async (req, res) => {
  try {
    console.log(' Creando avance con datos:', JSON.stringify(req.body, null, 2));

    const { profesor, materia, parcial } = req.body;
    if (!profesor || !materia || !parcial) {
      return res.status(400).json({
        message: 'Campos requeridos faltantes',
        required: ['profesor', 'materia', 'parcial'],
        received: { profesor, materia, parcial }
      });
    }

    const temasPlaneados = req.body.temasPlaneados || [];
    const temasCubiertos = req.body.temasCubiertos || [];
    let porcentajeCalculado = temasPlaneados.length > 0
      ? Math.round((temasCubiertos.length / temasPlaneados.length) * 100)
      : 0;

    const datosAvance = {
      ...req.body,
      porcentajeAvance: req.body.porcentajeAvance || porcentajeCalculado,
      cicloEscolar: req.body.cicloEscolar || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      temasPlaneados,
      temasCubiertos,
      actividadesRealizadas: req.body.actividadesRealizadas || [],
      dificultades: req.body.dificultades || '',
      observaciones: req.body.observaciones || ''
    };

    const nuevo = new Avance(datosAvance);
    await nuevo.save();
    
    res.status(201).json({
      message: 'Avance creado correctamente',
      data: nuevo
    });

  } catch (error) {
    console.error('ERROR en crearAvance:', error.message);
    res.status(500).json({
      message: 'Error interno al crear avance',
      error: error.message
    });
  }
};

// Obtener avances (con filtros)
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

// Obtener avance por ID
export const obtenerAvancePorId = async (req, res) => {
  try {
    const avance = await Avance.findById(req.params.id);
    if (!avance) {
      return res.status(404).json({ message: 'Avance no encontrado' });
    }
    res.json(avance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar avance
export const actualizarAvance = async (req, res) => {
  try {
    const actualizado = await Avance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: 'Avance no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar avance
export const eliminarAvance = async (req, res) => {
  try {
    const resultado = await Avance.findByIdAndDelete(req.params.id);
    
    if (!resultado) {
      return res.status(404).json({ message: 'Avance no encontrado' });
    }

    res.json({ message: 'Avance eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Estadísticas por profesor
export const obtenerEstadisticasProfesor = async (req, res) => {
  try {
    const { profesor, ciclo } = req.query;
    if (!profesor) return res.status(400).json({ message: 'Se requiere el parámetro profesor' });

    const filtro = { profesor };
    if (ciclo) filtro.cicloEscolar = ciclo;

    const avances = await Avance.find(filtro);

    const estadisticas = {
      total: avances.length,
      cumplido: avances.filter(a => a.cumplimiento === 'cumplido').length,
      parcial: avances.filter(a => a.cumplimiento === 'parcial').length,
      noCumplido: avances.filter(a => a.cumplimiento === 'no cumplido').length,
      promedioPorcentaje: avances.length ? 
        (avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length).toFixed(2) : 0,
      porMateria: {},
      porParcial: {
        1: avances.filter(a => a.parcial === 1).length,
        2: avances.filter(a => a.parcial === 2).length,
        3: avances.filter(a => a.parcial === 3).length
      }
    };

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

// Reporte general
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
        1: avances.filter(a => a.parcial === 1).length,
        2: avances.filter(a => a.parcial === 2).length,
        3: avances.filter(a => a.parcial === 3).length
      },
      promedioGlobal: avances.length ?
        (avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length).toFixed(2) : 0
    };

    avances.forEach(avance => {
      if (!reporte.porProfesor[avance.profesor]) {
        reporte.porProfesor[avance.profesor] = {
          total: 0, cumplido: 0, parcial: 0, noCumplido: 0, promedioPorcentaje: 0
        };
      }
      reporte.porProfesor[avance.profesor].total++;
      reporte.porProfesor[avance.profesor][avance.cumplimiento]++;
    });

    Object.keys(reporte.porProfesor).forEach(prof => {
      const profAvances = avances.filter(a => a.profesor === prof);
      reporte.porProfesor[prof].promedioPorcentaje =
        (profAvances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / profAvances.length).toFixed(2);
    });

    avances.forEach(avance => {
      if (!reporte.porMateria[avance.materia]) {
        reporte.porMateria[avance.materia] = {
          total: 0, cumplido: 0, parcial: 0, noCumplido: 0
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

// Datos para gráficas
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
      porcentajePromedio: avances.length ?
        Math.round(avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length) : 0
    };

    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const enviarRecordatorios = async (req, res) => {
  res.json({ message: "Función enviarRecordatorios aún no implementada" });
};
