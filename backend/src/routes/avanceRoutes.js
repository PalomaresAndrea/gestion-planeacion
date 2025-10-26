import express from 'express';
import {
  crearAvance,
  obtenerAvances,
  obtenerAvancePorId,
  actualizarAvance,
  eliminarAvance,
  obtenerEstadisticasProfesor,
  obtenerReporteGeneral,
  obtenerDatosGraficas,
  enviarRecordatorios // NUEVA FUNCIÓN IMPORTADA
} from '../controllers/avanceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Avances
 *   description: Control y seguimiento del avance por parcial
 */

/**
 * @swagger
 * /api/avances:
 *   get:
 *     summary: Obtener todos los avances registrados (con filtros opcionales)
 *     tags: [Avances]
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
 *         name: cumplimiento
 *         schema:
 *           type: string
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de avances
 */
router.get('/', obtenerAvances);

/**
 * @swagger
 * /api/avances/estadisticas-profesor:
 *   get:
 *     summary: Obtener estadísticas de cumplimiento por profesor
 *     tags: [Avances]
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
 * /api/avances/reporte-general:
 *   get:
 *     summary: Obtener reporte general de cumplimiento
 *     tags: [Avances]
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
 * /api/avances/graficas:
 *   get:
 *     summary: Obtener datos para gráficas de cumplimiento
 *     tags: [Avances]
 *     parameters:
 *       - in: query
 *         name: ciclo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos para gráficas
 */
router.get('/graficas', obtenerDatosGraficas);

/**
 * @swagger
 * /api/avances/{id}:
 *   get:
 *     summary: Obtener un avance por ID
 *     tags: [Avances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avance encontrado
 *       404:
 *         description: Avance no encontrado
 */
router.get('/:id', obtenerAvancePorId);

/**
 * @swagger
 * /api/avances:
 *   post:
 *     summary: Crear un nuevo avance
 *     tags: [Avances]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Avance'
 *     responses:
 *       201:
 *         description: Avance creado correctamente
 */
router.post('/', crearAvance);

/**
 * @swagger
 * /api/avances/recordatorios:
 *   post:
 *     summary: Enviar recordatorios por email a profesores con avances pendientes
 *     tags: [Avances]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciclo:
 *                 type: string
 *                 description: Ciclo escolar para filtrar (opcional)
 *     responses:
 *       200:
 *         description: Recordatorios enviados exitosamente
 *       500:
 *         description: Error al enviar recordatorios
 */
router.post('/recordatorios', enviarRecordatorios);

// 🧪 RUTA DE PRUEBA - NUEVA
router.post('/test', async (req, res) => {
  try {
    console.log('🧪 TEST endpoint llamado con:', req.body);
    res.json({ 
      message: '✅ Test exitoso', 
      dataReceived: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/avances/{id}:
 *   put:
 *     summary: Actualizar avance por ID
 *     tags: [Avances]
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
 *             $ref: '#/components/schemas/Avance'
 *     responses:
 *       200:
 *         description: Avance actualizado
 */
router.put('/:id', actualizarAvance);

/**
 * @swagger
 * /api/avances/{id}:
 *   delete:
 *     summary: Eliminar avance por ID
 *     tags: [Avances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avance eliminado correctamente
 */
router.delete('/:id', eliminarAvance);

export default router;