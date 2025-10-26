import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/docs/swagger.js';

import planeacionRoutes from './src/routes/planeacionRoutes.js';
import avanceRoutes from './src/routes/avanceRoutes.js';
import evidenciaRoutes from './src/routes/evidenciaRoutes.js';
import geolocalizacionRoutes from './src/routes/geolocalizacionRoutes.js';
import reporteRoutes from './src/routes/reporteRoutes.js';

dotenv.config();
const app = express();

//  MIDDLEWARE DE LOGGING - NUEVO
app.use((req, res, next) => {
  console.log('📨 Request:', req.method, req.url);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// 🔌 Middleware
app.use(cors());
app.use(express.json());

//  Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API - Gestión Planeación Académica"
}));

//  Rutas principales
app.use('/api/planeaciones', planeacionRoutes);
app.use('/api/avances', avanceRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use("/api/geolocalizacion", geolocalizacionRoutes);
app.use('/api/reportes', reporteRoutes);

//  Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: ' Backend activo y listo con Swagger!',
    documentation: '/api-docs',
    endpoints: {
      planeaciones: '/api/planeaciones',
      avances: '/api/avances',
      evidencias: '/api/evidencias',
      reportes: '/api/reportes'
    }
  });
});

//  Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET    /api/planeaciones',
      'POST   /api/planeaciones', 
      'GET    /api/planeaciones/ciclo-actual',
      'GET    /api/planeaciones/historial',
      'GET    /api/planeaciones/:id',
      'PUT    /api/planeaciones/:id',
      'PUT    /api/planeaciones/:id/revisar',
      'GET    /api/avances',
      'POST   /api/avances',
      'PUT    /api/avances/:id', 
      'DELETE /api/avances/:id',
      'GET    /api/evidencias',
      'POST   /api/evidencias',
      'GET    /api/reportes/institucional',
      'GET    /api/reportes/profesor',
      'GET    /api-docs'
    ]
  });
});

//  Manejo global de errores - MEJORADO
app.use((error, req, res, next) => {
  console.error(' ERROR GLOBAL:');
  console.error('Mensaje:', error.message);
  console.error('Stack:', error.stack);
  console.error('Tipo:', error.name);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Error de validación',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'ID inválido'
    });
  }

  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

//  Conexión a MongoDB
connectDB();

//  Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
     Servidor corriendo en puerto ${PORT}
     Documentación disponible en: http://localhost:${PORT}/api-docs
     Ambiente: ${process.env.NODE_ENV || 'development'}
     Logging activado - Revisa la consola para ver las peticiones
  `);
});