import Planeacion from '../models/Planeacion.js';
import Avance from '../models/Avance.js';
import Evidencia from '../models/Evidencia.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import stream from 'stream';

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
    const { formato, tipo, ciclo, profesor } = req.query;

    const modelos = {
      avance: Avance,
      evidencia: Evidencia,
      planeacion: Planeacion,
      profesor: Avance 
    };

    const Modelo = modelos[tipo];
    if (!Modelo) {
      return res.status(400).json({ message: 'Tipo de reporte inválido.' });
    }

    // ? Filtros dinámicos
    const filtro = {};
    if (ciclo) filtro.cicloEscolar = ciclo;
    if (profesor) filtro.profesor = profesor;

    const data = await Modelo.find(filtro).lean();

    // ? Exportar a Excel
    if (formato === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`Reporte ${tipo}`);

      // Título principal
      sheet.mergeCells('A1', 'E1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = `Reporte de ${tipo.toUpperCase()} ${ciclo ? `(${ciclo})` : ''}`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.addRow([]);

      // Crear encabezados dinámicos
      const sample = data.length ? data[0] : { mensaje: 'Sin registros disponibles' };
      const columnas = Object.keys(sample).map(key => ({
        header: key,
        key,
        width: 25
      }));
      sheet.columns = columnas;

      // Agregar filas
      if (data.length) {
        data.forEach(item => sheet.addRow(item));
      } else {
        sheet.addRow({ mensaje: 'No hay datos para mostrar en este reporte.' });
      }

      // Estilo encabezados
      sheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2F5597' }
      };

      // ? Enviar archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${tipo}-${ciclo || 'general'}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // ? Exportar a PDF
    if (formato === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const passthrough = new stream.PassThrough();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte-${tipo}-${ciclo || 'general'}.pdf`);

      doc.pipe(passthrough);
      passthrough.pipe(res);

      // Encabezado institucional
      doc
        .fontSize(18)
        .text('Instituto Tecnológico Superior', { align: 'center', bold: true })
        .moveDown(0.5);
      doc
        .fontSize(14)
        .text(`Reporte de ${tipo.toUpperCase()} ${ciclo ? `(${ciclo})` : ''}`, { align: 'center' })
        .moveDown(1);

      if (data.length) {
        // Renderizar registros
        data.forEach((item, index) => {
          doc
            .fontSize(12)
            .fillColor('#2F5597')
            .text(`Registro ${index + 1}`, { underline: true });
          doc.moveDown(0.5);

          doc.fillColor('black');
          Object.entries(item).forEach(([key, value]) => {
            doc.text(`${key}: ${value ?? ''}`);
          });
          doc.moveDown();
        });
      } else {
        // Reporte vacío profesional
        doc.moveDown(3);
        doc.fontSize(13).fillColor('gray')
          .text('No existen registros disponibles para los criterios seleccionados.', {
            align: 'center',
            italic: true
          });
      }

      // Pie de página
      doc.moveDown(3);
      doc
        .fontSize(10)
        .fillColor('gray')
        .text('Generado automáticamente por el sistema de reportes.', {
          align: 'center'
        });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Formato no soportado. Use "excel" o "pdf".' });
  } catch (error) {
    console.error('Error en exportarReporte:', error);
    res.status(500).json({ message: error.message });
  }
};