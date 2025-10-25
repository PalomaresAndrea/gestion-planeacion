import express from 'express';
import {
  crearPlaneacion,
  obtenerPlaneaciones,
  obtenerPlaneacionPorId,
  actualizarPlaneacion,
  revisarPlaneacion,
  obtenerHistorial,
  obtenerPlaneacionesCicloActual
} from '../controllers/planeacionController.js';

const router = express.Router();

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
 *     summary: Crear una nueva planeación didáctica
 *     tags: [Planeaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Planeacion'
 *     responses:
 *       201:
 *         description: Planeación creada correctamente
 */
router.post('/', crearPlaneacion);

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
 *               coordinadorRevisor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Revisión completada
 */
router.put('/:id/revisar', revisarPlaneacion);

export default router;