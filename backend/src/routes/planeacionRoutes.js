import express from 'express';
import {
  crearPlaneacion,
  obtenerPlaneaciones,
  obtenerPlaneacionPorId,
  actualizarPlaneacion,
  revisarPlaneacion,
  obtenerHistorial,
  obtenerPlaneacionesCicloActual,
  upload,
  descargarArchivo,
  verArchivo
} from '../controllers/planeacionController.js';
import { autenticar } from '../middlewares/auth.js'; // Importar middleware

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de planeaciones
router.use(autenticar);

/**
 * @swagger
 * /api/planeaciones:
 *   get:
 *     summary: Obtener todas las planeaciones (con filtros opcionales)
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: query
 *         name: profesor
 *         schema:
 *           type: string
 *       - in: query
 *         name: materia
 *         schema:
 *           type: string
 *       - in: query
 *         name: parcial
 *         schema:
 *           type: number
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de planeaciones
 */
router.get('/', obtenerPlaneaciones);

/**
 * @swagger
 * /api/planeaciones/ciclo-actual:
 *   get:
 *     summary: Obtener planeaciones del ciclo escolar actual
 *     tags: [Planeaciones]
 *     responses:
 *       200:
 *         description: Planeaciones del ciclo actual
 */
router.get('/ciclo-actual', obtenerPlaneacionesCicloActual);

/**
 * @swagger
 * /api/planeaciones/historial:
 *   get:
 *     summary: Obtener historial de planeaciones por profesor y materia
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: query
 *         name: profesor
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: materia
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de planeaciones
 */
router.get('/historial', obtenerHistorial);

/**
 * @swagger
 * /api/planeaciones/{id}:
 *   get:
 *     summary: Obtener una planeación por ID
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Planeación encontrada
 *       404:
 *         description: Planeación no encontrada
 */
router.get('/:id', obtenerPlaneacionPorId);

/**
 * @swagger
 * /api/planeaciones:
 *   post:
 *     summary: Crear una nueva planeación didáctica CON ARCHIVO PDF
 *     tags: [Planeaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profesor:
 *                 type: string
 *               materia:
 *                 type: string
 *               parcial:
 *                 type: number
 *               cicloEscolar:
 *                 type: string
 *               archivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Planeación creada correctamente
 */
router.post('/', upload.single('archivo'), crearPlaneacion);

/**
 * @swagger
 * /api/planeaciones/{id}:
 *   put:
 *     summary: Actualizar una planeación
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Planeacion'
 *     responses:
 *       200:
 *         description: Planeación actualizada
 */
router.put('/:id', actualizarPlaneacion);

/**
 * @swagger
 * /api/planeaciones/{id}/revisar:
 *   put:
 *     summary: Revisar planeación (para coordinadores)
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [aprobado, rechazado, ajustes_solicitados]
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Revisión completada
 */
router.put('/:id/revisar', revisarPlaneacion);

/**
 * @swagger
 * /api/planeaciones/{id}/archivo:
 *   get:
 *     summary: Descargar archivo de planeación
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo descargado
 *       404:
 *         description: Archivo no encontrado
 */
router.get('/:id/archivo', descargarArchivo);

/**
 * @swagger
 * /api/planeaciones/{id}/ver:
 *   get:
 *     summary: Ver archivo de planeación en el navegador
 *     tags: [Planeaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo mostrado en navegador
 *       404:
 *         description: Archivo no encontrado
 */
router.get('/:id/ver', verArchivo);

export default router;