// controllers/reporteController.js
import Planeacion from '../models/Planeacion.js';
import Avance from '../models/Avance.js';
import Evidencia from '../models/Evidencia.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * 🔹 Reporte Institucional (JSON)
 */
export const obtenerReporteInstitucionalJSON = async (req, res) => {
  try {
    const { ciclo } = req.query;
    const filtro = ciclo ? { cicloEscolar: ciclo } : {};

    const [planeaciones, avances, evidencias] = await Promise.all([
      Planeacion.find(filtro).lean(),
      Avance.find(filtro).lean(),
      Evidencia.find(filtro).lean(),
    ]);

    const planeacionesAprobadas = planeaciones.filter(p => p.estado === 'aprobado').length;
    const porcentajeAprobacionPlaneaciones = planeaciones.length
      ? (planeacionesAprobadas / planeaciones.length * 100).toFixed(2)
      : 0;

    const avancesCumplidos = avances.filter(a => a.cumplimiento === 'cumplido').length;
    const porcentajeCumplimientoAvances = avances.length
      ? (avancesCumplidos / avances.length * 100).toFixed(2)
      : 0;

    const totalHorasCapacitacion = evidencias
      .filter(e => e.estado === 'validada')
      .reduce((acc, e) => acc + e.horasAcreditadas, 0);

    const profesoresUnicos = [...new Set([
      ...planeaciones.map(p => p.profesor),
      ...avances.map(a => a.profesor),
      ...evidencias.map(e => e.profesor),
    ])];

    const porParcial = [1, 2, 3].reduce((acc, p) => {
      acc[p] = {
        planeaciones: planeaciones.filter(pl => pl.parcial === p).length,
        avances: avances.filter(av => av.parcial === p).length,
      };
      return acc;
    }, {});

    const reporte = {
      periodo: ciclo || 'Todos los ciclos',
      fechaGeneracion: new Date().toISOString(),
      resumenGeneral: {
        totalProfesores: profesoresUnicos.length,
        totalPlaneaciones: planeaciones.length,
        totalAvances: avances.length,
        totalEvidencias: evidencias.length,
      },
      planeaciones: {
        total: planeaciones.length,
        aprobadas: planeacionesAprobadas,
        pendientes: planeaciones.filter(p => p.estado === 'pendiente').length,
        rechazadas: planeaciones.filter(p => p.estado === 'rechazado').length,
        ajustesSolicitados: planeaciones.filter(p => p.estado === 'ajustes_solicitados').length,
        porcentajeAprobacion: parseFloat(porcentajeAprobacionPlaneaciones),
      },
      avances: {
        total: avances.length,
        cumplido: avancesCumplidos,
        parcial: avances.filter(a => a.cumplimiento === 'parcial').length,
        noCumplido: avances.filter(a => a.cumplimiento === 'no cumplido').length,
        porcentajeCumplimiento: parseFloat(porcentajeCumplimientoAvances),
        porcentajePromedio: avances.length
          ? (avances.reduce((acc, a) => acc + a.porcentajeAvance, 0) / avances.length).toFixed(2)
          : 0,
      },
      capacitacionDocente: {
        totalCursos: evidencias.length,
        cursosValidadas: evidencias.filter(e => e.estado === 'validada').length,
        cursosPendientes: evidencias.filter(e => e.estado !== 'validada').length,
        totalHorasAcreditadas: totalHorasCapacitacion,
        promedioHorasPorProfesor: profesoresUnicos.length
          ? (totalHorasCapacitacion / profesoresUnicos.length).toFixed(2)
          : 0,
      },
      porParcial,
    };

    res.json(reporte);
  } catch (error) {
    console.error('Error obteniendo reporte institucional:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 👨‍🏫 Reporte por profesor
 */
export const obtenerReportePorProfesor = async (req, res) => {
  try {
    const { profesor, ciclo } = req.query;
    if (!profesor) return res.status(400).json({ message: 'Se requiere el parámetro profesor' });

    const filtro = { profesor };
    if (ciclo) filtro.cicloEscolar = ciclo;

    const [planeaciones, avances, evidencias] = await Promise.all([
      Planeacion.find(filtro).lean(),
      Avance.find(filtro).lean(),
      Evidencia.find(filtro).lean(),
    ]);

    const reporte = {
      profesor,
      periodo: ciclo || 'Todos los ciclos',
      fechaGeneracion: new Date().toISOString(),
      resumen: {
        planeacionesRegistradas: planeaciones.length,
        avancesRegistrados: avances.length,
        cursosTomados: evidencias.length,
      },
      detallePlaneaciones: {
        porEstado: planeaciones.reduce((acc, p) => {
          acc[p.estado] = (acc[p.estado] || 0) + 1;
          return acc;
        }, {}),
      },
      detalleAvances: {
        porcentajePromedio: avances.length
          ? (avances.reduce((acc, a) => acc + a.porcentajeAvance, 0) / avances.length).toFixed(2)
          : 0,
      },
      detalleCapacitacion: {
        totalHoras: evidencias.reduce((acc, e) => acc + e.horasAcreditadas, 0),
      },
    };

    res.json(reporte);
  } catch (error) {
    console.error('Error obteniendo reporte por profesor:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📤 Exportar reportes (Excel / PDF)
 */
export const exportarReporte = async (req, res) => {
  try {
    const { tipo, formato, ciclo, profesor } = req.query;
    
    if (!tipo || !formato) {
      return res.status(400).json({ message: 'Debe especificar tipo y formato.' });
    }

    if (tipo === 'institucional') {
      const data = await obtenerDatosInstitucional(ciclo);
      return generarArchivo(formato, res, data, 'reporte-institucional', ciclo);
    }

    if (tipo === 'profesor') {
      if (!profesor) return res.status(400).json({ message: 'Debe especificar el nombre del profesor.' });
      const data = await obtenerDatosProfesor(profesor, ciclo);
      return generarArchivo(formato, res, data, `reporte-profesor-${profesor}`, ciclo);
    }

    res.status(400).json({ message: 'Tipo de reporte inválido.' });
  } catch (error) {
    console.error('Error exportando reporte:', error);
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// FUNCIONES AUXILIARES
// ===============================
async function obtenerDatosInstitucional(ciclo) {
  const filtro = ciclo ? { cicloEscolar: ciclo } : {};
  const [planeaciones, avances, evidencias] = await Promise.all([
    Planeacion.find(filtro).lean(),
    Avance.find(filtro).lean(),
    Evidencia.find(filtro).lean(),
  ]);

  return {
    tipo: 'institucional',
    periodo: ciclo || 'Todos',
    totalPlaneaciones: planeaciones.length,
    totalAvances: avances.length,
    totalEvidencias: evidencias.length,
    planeacionesAprobadas: planeaciones.filter(p => p.estado === 'aprobado').length,
    avancesCumplidos: avances.filter(a => a.cumplimiento === 'cumplido').length,
    horasCapacitacion: evidencias.reduce((acc, e) => acc + (e.horasAcreditadas || 0), 0),
  };
}

async function obtenerDatosProfesor(profesor, ciclo) {
  const filtro = { profesor };
  if (ciclo) filtro.cicloEscolar = ciclo;

  const [planeaciones, avances, evidencias] = await Promise.all([
    Planeacion.find(filtro).lean(),
    Avance.find(filtro).lean(),
    Evidencia.find(filtro).lean(),
  ]);

  return {
    tipo: 'profesor',
    profesor,
    periodo: ciclo || 'Todos',
    planeaciones: planeaciones.length,
    avances: avances.length,
    evidencias: evidencias.length,
    promedioAvance: avances.length
      ? (avances.reduce((a, b) => a + b.porcentajeAvance, 0) / avances.length).toFixed(2)
      : 0,
  };
}

// ===============================
// EXPORTADOR CON DISEÑO PROFESIONAL
// ===============================
async function generarArchivo(formato, res, data, nombre, ciclo) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return res.status(404).json({ message: 'No hay datos para exportar.' });
  }

  // 🔹 PDF con diseño profesional
  if (formato === 'pdf') {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombre}.pdf`);
    doc.pipe(res);

    // ============ ENCABEZADO ============
    doc.rect(0, 0, doc.page.width, 80).fill('#003366');
    doc.fillColor('white').fontSize(22).text('REPORTE DE PLANEACIÓN ACADÉMICA', 0, 25, { align: 'center' });

    doc.moveDown(3);

    // ============ SECCIÓN INFORMACIÓN ============
    doc.fillColor('#003366').fontSize(16).text('Información General', 45,96, { underline: true });
    doc.moveDown(0.5);

    const info = [
      ['Tipo de reporte', data.tipo.toUpperCase()],
      data.profesor ? ['Profesor', data.profesor] : null,
      ['Periodo', data.periodo],
      ['Fecha de generación', new Date().toLocaleDateString()],
    ].filter(Boolean);

    let y = doc.y + 5;
    info.forEach(([label, value]) => {
      doc.fillColor('#003366').fontSize(12).text(label + ':', 50, y);
      doc.fillColor('#000').text(value, 200, y);
      y += 18;
    });

    doc.moveDown(2);

    // ============ CUADRO DE DATOS ============
    doc.fillColor('#003366').fontSize(16).text('Resumen del Reporte', { underline: true });
    doc.moveDown(1);

    const boxStartY = doc.y;
    doc.roundedRect(45, boxStartY - 5, 520, 180, 8).strokeColor('#003366').lineWidth(1).stroke();

    doc.fontSize(12).fillColor('#000');
    let textY = boxStartY + 10;

    Object.entries(data).forEach(([key, value]) => {
      if (!['tipo', 'profesor', 'periodo'].includes(key)) {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const val = typeof value === 'object' ? JSON.stringify(value) : value;
        doc.text(`${formattedKey}: ${val}`, 60, textY);
        textY += 18;
      }
    });

    // ============ PIE DE PÁGINA ============
    doc.moveTo(50, doc.page.height - 100).lineTo(550, doc.page.height - 100).strokeColor('#003366').stroke();
    doc.fontSize(10).fillColor('#555')
      .text('Sistema de Gestión Académica', 0, doc.page.height - 80, { align: 'center' })
      .text('Documento generado automáticamente. No requiere firma.', 0, doc.page.height - 65, { align: 'center' });

    doc.end();
    return;
  }

  // 🔹 EXCEL EXPORT
  if (formato === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte');
    sheet.addRow([`Reporte: ${nombre}`]);
    sheet.addRow([`Periodo: ${ciclo || 'General'}`]);
    sheet.addRow([]);

    if (Array.isArray(data)) {
      if (data.length > 0) {
        const columnas = Object.keys(data[0]).map(k => ({ header: k, key: k, width: 25 }));
        sheet.columns = columnas;
        data.forEach(d => sheet.addRow(d));
      }
    } else {
      Object.entries(data).forEach(([key, value]) => {
        sheet.addRow([key, typeof value === 'object' ? JSON.stringify(value) : value]);
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${nombre}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  res.status(400).json({ message: 'Formato no soportado. Use "excel" o "pdf".' });
}
