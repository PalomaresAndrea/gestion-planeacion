import Planeacion from '../models/Planeacion.js';
import Avance from '../models/Avance.js';
import Evidencia from '../models/Evidencia.js';

//  Reporte institucional consolidado
export const obtenerReporteInstitucional = async (req, res) => {
  try {
    const { ciclo } = req.query;
    const filtro = ciclo ? { cicloEscolar: ciclo } : {};

    // Obtener datos de las 3 colecciones en paralelo
    const [planeaciones, avances, evidencias] = await Promise.all([
      Planeacion.find(filtro),
      Avance.find(filtro),
      Evidencia.find(filtro)
    ]);

    // Calcular porcentaje de cumplimiento de planeaciones
    const planeacionesAprobadas = planeaciones.filter(p => p.estado === 'aprobado').length;
    const porcentajeAprobacionPlaneaciones = planeaciones.length > 0 
      ? (planeacionesAprobadas / planeaciones.length * 100).toFixed(2) 
      : 0;

    // Calcular cumplimiento de avances
    const avancesCumplidos = avances.filter(a => a.cumplimiento === 'cumplido').length;
    const porcentajeCumplimientoAvances = avances.length > 0 
      ? (avancesCumplidos / avances.length * 100).toFixed(2) 
      : 0;

    // Calcular horas de capacitación
    const totalHorasCapacitacion = evidencias
      .filter(e => e.estado === 'validada')
      .reduce((acc, curr) => acc + curr.horasAcreditadas, 0);

    const reporte = {
      periodo: ciclo || 'Todos los ciclos',
      fechaGeneracion: new Date().toISOString(),
      resumenGeneral: {
        totalProfesores: [...new Set([
          ...planeaciones.map(p => p.profesor),
          ...avances.map(a => a.profesor),
          ...evidencias.map(e => e.profesor)
        ])].length,
        totalPlaneaciones: planeaciones.length,
        totalAvances: avances.length,
        totalEvidencias: evidencias.length
      },
      planeaciones: {
        total: planeaciones.length,
        aprobadas: planeacionesAprobadas,
        pendientes: planeaciones.filter(p => p.estado === 'pendiente').length,
        rechazadas: planeaciones.filter(p => p.estado === 'rechazado').length,
        ajustesSolicitados: planeaciones.filter(p => p.estado === 'ajustes_solicitados').length,
        porcentajeAprobacion: parseFloat(porcentajeAprobacionPlaneaciones)
      },
      avances: {
        total: avances.length,
        cumplido: avancesCumplidos,
        parcial: avances.filter(a => a.cumplimiento === 'parcial').length,
        noCumplido: avances.filter(a => a.cumplimiento === 'no cumplido').length,
        porcentajeCumplimiento: parseFloat(porcentajeCumplimientoAvances),
        porcentajePromedio: avances.length > 0 
          ? (avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length).toFixed(2)
          : 0
      },
      capacitacionDocente: {
        totalCursos: evidencias.length,
        cursosValidadas: evidencias.filter(e => e.estado === 'validada').length,
        cursosPendientes: evidencias.filter(e => e.estado === 'pendiente').length,
        cursosRechazadas: evidencias.filter(e => e.estado === 'rechazada').length,
        totalHorasAcreditadas: totalHorasCapacitacion,
        promedioHorasPorProfesor: evidencias.length > 0 
          ? (totalHorasCapacitacion / [...new Set(evidencias.map(e => e.profesor))].length).toFixed(2)
          : 0,
        distribucionPorTipo: evidencias.reduce((acc, curr) => {
          acc[curr.tipoCapacitacion] = (acc[curr.tipoCapacitacion] || 0) + 1;
          return acc;
        }, {})
      },
      porParcial: {
        1: {
          planeaciones: planeaciones.filter(p => p.parcial === 1).length,
          avances: avances.filter(a => a.parcial === 1).length
        },
        2: {
          planeaciones: planeaciones.filter(p => p.parcial === 2).length,
          avances: avances.filter(a => a.parcial === 2).length
        },
        3: {
          planeaciones: planeaciones.filter(p => p.parcial === 3).length,
          avances: avances.filter(a => a.parcial === 3).length
        }
      }
    };

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Reporte de cumplimiento por profesor
export const obtenerReportePorProfesor = async (req, res) => {
  try {
    const { profesor, ciclo } = req.query;
    
    if (!profesor) {
      return res.status(400).json({ message: 'Se requiere el parámetro profesor' });
    }

    const filtro = { profesor };
    if (ciclo) filtro.cicloEscolar = ciclo;

    const [planeaciones, avances, evidencias] = await Promise.all([
      Planeacion.find(filtro),
      Avance.find(filtro),
      Evidencia.find(filtro)
    ]);

    const reporte = {
      profesor,
      periodo: ciclo || 'Todos los ciclos',
      fechaGeneracion: new Date().toISOString(),
      resumen: {
        planeacionesRegistradas: planeaciones.length,
        avancesRegistrados: avances.length,
        cursosTomados: evidencias.length
      },
      detallePlaneaciones: {
        porEstado: planeaciones.reduce((acc, curr) => {
          acc[curr.estado] = (acc[curr.estado] || 0) + 1;
          return acc;
        }, {}),
        porMateria: planeaciones.reduce((acc, curr) => {
          if (!acc[curr.materia]) acc[curr.materia] = {};
          acc[curr.materia][curr.estado] = (acc[curr.materia][curr.estado] || 0) + 1;
          return acc;
        }, {})
      },
      detalleAvances: {
        porCumplimiento: avances.reduce((acc, curr) => {
          acc[curr.cumplimiento] = (acc[curr.cumplimiento] || 0) + 1;
          return acc;
        }, {}),
        porcentajePromedio: avances.length > 0 
          ? (avances.reduce((acc, curr) => acc + curr.porcentajeAvance, 0) / avances.length).toFixed(2)
          : 0,
        porMateria: avances.reduce((acc, curr) => {
          if (!acc[curr.materia]) acc[curr.materia] = {};
          acc[curr.materia][curr.cumplimiento] = (acc[curr.materia][curr.cumplimiento] || 0) + 1;
          return acc;
        }, {})
      },
      detalleCapacitacion: {
        totalHoras: evidencias.reduce((acc, curr) => acc + curr.horasAcreditadas, 0),
        porTipo: evidencias.reduce((acc, curr) => {
          acc[curr.tipoCapacitacion] = (acc[curr.tipoCapacitacion] || 0) + 1;
          return acc;
        }, {}),
        porInstitucion: evidencias.reduce((acc, curr) => {
          acc[curr.institucion] = (acc[curr.institucion] || 0) + 1;
          return acc;
        }, {})
      }
    };

    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📤 Exportar reporte (placeholder para PDF/Excel)
export const exportarReporte = async (req, res) => {
  try {
    const { formato, tipo, ciclo } = req.query;
    
    // Por ahora solo retornamos JSON, pero aquí se integraría la librería de exportación
    if (formato === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${tipo}-${ciclo || 'general'}.xlsx`);
      return res.json({ message: 'Exportación Excel - Implementar con exceljs' });
    }
    
    if (formato === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${tipo}-${ciclo || 'general'}.pdf`);
      return res.json({ message: 'Exportación PDF - Implementar con pdfkit' });
    }

    res.status(400).json({ message: 'Formato no soportado. Use "excel" o "pdf"' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};