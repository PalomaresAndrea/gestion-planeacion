import express from 'express';
import {
  crearEvidencia,
  obtenerEvidencias,
  obtenerEvidenciaPorId,
  actualizarEvidencia,
  eliminarEvidencia,
  validarEvidencia,
  obtenerEstadisticasProfesor,
  obtenerReporteGeneral,
  buscarEvidencias
} from '../controllers/evidenciaController.js';
import { autenticar } from '../middlewares/auth.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas de evidencias
router.use(autenticar);

/**
 * @swagger
 * tags:
 *   name: Evidencias
 *   description: Gestión de evidencias de capacitación docente
 */

/**
 * @swagger
 * /api/evidencias:
 *   get:
 *     summary: Obtener todas las evidencias registradas (con filtros opcionales)
 *     tags: [Evidencias]
 *     parameters:
 *       - in: query
 *         name: profesor
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *       - in: query
 *         name: institucion
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de evidencias
 */
router.get('/', obtenerEvidencias);

/**
 * @swagger
 * /api/evidencias/buscar:
 *   get:
 *     summary: Buscar evidencias por nombre de curso, institución o profesor
 *     tags: [Evidencias]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/buscar', buscarEvidencias);

/**
 * @swagger
 * /api/evidencias/estadisticas-profesor:
 *   get:
 *     summary: Obtener estadísticas de evidencias por profesor
 *     tags: [Evidencias]
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
 *         description: Estadísticas del profesor
 */
router.get('/estadisticas-profesor', obtenerEstadisticasProfesor);

/**
 * @swagger
 * /api/evidencias/reporte-general:
 *   get:
 *     summary: Obtener reporte general de evidencias
 *     tags: [Evidencias]
 *     parameters:
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte general
 */
router.get('/reporte-general', obtenerReporteGeneral);

/**
 * @swagger
 * /api/evidencias/{id}:
 *   get:
 *     summary: Obtener una evidencia por ID
 *     tags: [Evidencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evidencia encontrada
 *       404:
 *         description: Evidencia no encontrada
 */
router.get('/:id', obtenerEvidenciaPorId);

/**
 * @swagger
 * /api/evidencias:
 *   post:
 *     summary: Crear nueva evidencia
 *     tags: [Evidencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Evidencia'
 *     responses:
 *       201:
 *         description: Evidencia creada correctamente
 */
router.post('/', crearEvidencia);

/**
 * @swagger
 * /api/evidencias/{id}:
 *   put:
 *     summary: Actualizar evidencia por ID
 *     tags: [Evidencias]
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
 *             $ref: '#/components/schemas/Evidencia'
 *     responses:
 *       200:
 *         description: Evidencia actualizada
 */
router.put('/:id', actualizarEvidencia);

/**
 * @swagger
 * /api/evidencias/{id}/validar:
 *   put:
 *     summary: Validar o rechazar evidencia (para coordinadores)
 *     tags: [Evidencias]
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
 *                 enum: [validada, rechazada]
 *               observaciones:
 *                 type: string
 *               coordinadorValidador:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evidencia validada/rechazada
 */
router.put('/:id/validar', validarEvidencia);

/**
 * @swagger
 * /api/evidencias/{id}:
 *   delete:
 *     summary: Eliminar evidencia por ID
 *     tags: [Evidencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evidencia eliminada correctamente
 */
router.delete('/:id', eliminarEvidencia);

export default router;