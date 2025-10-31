import express from 'express';
import {
  obtenerReporteInstitucionalJSON,
  obtenerReportePorProfesor,
  exportarReporte
} from '../controllers/reporteController.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de reportes
router.use(autenticar);

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Endpoints para reportes institucionales y exportación
 */

/**
 * @swagger
 * /api/reportes/institucional:
 *   get:
 *     summary: Obtener reporte institucional consolidado
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *         description: Ciclo escolar específico (ej. 2024-2025)
 *     responses:
 *       200:
 *         description: Reporte institucional generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 periodo:
 *                   type: string
 *                 resumenGeneral:
 *                   type: object
 *                 planeaciones:
 *                   type: object
 *                 avances:
 *                   type: object
 *                 capacitacionDocente:
 *                   type: object
 */
router.get('/institucional', obtenerReporteInstitucionalJSON);

/**
 * @swagger
 * /api/reportes/profesor:
 *   get:
 *     summary: Obtener reporte detallado por profesor
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: profesor
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte del profesor generado
 */
router.get('/profesor', obtenerReportePorProfesor);

/**
 * @swagger
 * /api/reportes/exportar:
 *   get:
 *     summary: Exportar reporte en diferentes formatos
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: formato
 *         required: true
 *         schema:
 *           type: string
 *           enum: [excel, pdf]
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [institucional, profesor]
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *       - in: query
 *         name: profesor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo exportado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/exportar', exportarReporte);

export default router;