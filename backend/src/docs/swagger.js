import swaggerJsdoc from 'swagger-jsdoc';

// 📄 Configuración de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API - Gestión de Planeación Académica',
      version: '1.0.0',
      description:
        'Documentación de la API para el sistema de gestión de planeación didáctica, avances y evidencias docentes.',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'soporte@planeacion.edu.mx',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor local',
      },
    ],
    components: {
      schemas: {
        Planeacion: {
          type: 'object',
          required: ['profesor', 'materia', 'parcial', 'archivo'],
          properties: {
            profesor: {
              type: 'string',
              description: 'Nombre del profesor',
              example: 'Juan Pérez'
            },
            materia: {
              type: 'string',
              description: 'Nombre de la materia',
              example: 'Matemáticas Avanzadas'
            },
            parcial: {
              type: 'number',
              description: 'Número del parcial (1, 2, 3)',
              minimum: 1,
              maximum: 3,
              example: 1
            },
            cicloEscolar: {
              type: 'string',
              description: 'Ciclo escolar (ej. 2024-2025)',
              default: '2024-2025',
              example: '2024-2025'
            },
            archivo: {
              type: 'string',
              description: 'URL o nombre del archivo subido',
              example: 'planeacion_matematicas_parcial1.pdf'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'aprobado', 'rechazado', 'ajustes_solicitados'],
              description: 'Estado de revisión de la planeación',
              default: 'pendiente',
              example: 'pendiente'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones del coordinador',
              example: 'Favor de incluir más ejercicios prácticos'
            },
            coordinadorRevisor: {
              type: 'string',
              description: 'Nombre del coordinador que revisa',
              example: 'María García'
            }
          }
        },
        Avance: {
          type: 'object',
          required: ['profesor', 'materia', 'parcial', 'temasPlaneados', 'temasCubiertos', 'cumplimiento'],
          properties: {
            profesor: {
              type: 'string',
              description: 'Nombre del profesor',
              example: 'Juan Pérez'
            },
            materia: {
              type: 'string',
              description: 'Nombre de la materia',
              example: 'Matemáticas Avanzadas'
            },
            parcial: {
              type: 'number',
              description: 'Número del parcial (1, 2, 3)',
              minimum: 1,
              maximum: 3,
              example: 1
            },
            cicloEscolar: {
              type: 'string',
              description: 'Ciclo escolar (ej. 2024-2025)',
              default: '2024-2025',
              example: '2024-2025'
            },
            temasPlaneados: {
              type: 'array',
              description: 'Lista de temas planeados para el parcial',
              items: {
                type: 'string'
              },
              example: ['Álgebra lineal', 'Cálculo diferencial', 'Estadística descriptiva']
            },
            temasCubiertos: {
              type: 'array',
              description: 'Lista de temas cubiertos efectivamente',
              items: {
                type: 'string'
              },
              example: ['Álgebra lineal', 'Cálculo diferencial']
            },
            porcentajeAvance: {
              type: 'number',
              description: 'Porcentaje de avance calculado automáticamente',
              minimum: 0,
              maximum: 100,
              example: 67
            },
            cumplimiento: {
              type: 'string',
              enum: ['cumplido', 'parcial', 'no cumplido'],
              description: 'Nivel de cumplimiento del avance',
              example: 'parcial'
            },
            actividadesRealizadas: {
              type: 'array',
              description: 'Actividades realizadas durante el parcial',
              items: {
                type: 'string'
              },
              example: ['Exámenes parciales', 'Tareas', 'Proyectos en equipo']
            },
            dificultades: {
              type: 'string',
              description: 'Dificultades encontradas durante el parcial',
              example: 'Falta de participación en clases virtuales'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones adicionales del profesor',
              example: 'Se requieren más sesiones de práctica'
            }
          }
        },
        Evidencia: {
          type: 'object',
          required: ['profesor', 'nombreCurso', 'institucion', 'fechaInicio', 'fechaFin', 'horasAcreditadas', 'tipoCapacitacion', 'archivo'],
          properties: {
            profesor: {
              type: 'string',
              description: 'Nombre del profesor',
              example: 'Ana López'
            },
            nombreCurso: {
              type: 'string',
              description: 'Nombre del curso o capacitación',
              example: 'Metodologías Activas de Aprendizaje'
            },
            institucion: {
              type: 'string',
              description: 'Institución que impartió el curso',
              example: 'Universidad Nacional'
            },
            fechaInicio: {
              type: 'string',
              format: 'date',
              description: 'Fecha de inicio del curso',
              example: '2024-02-01'
            },
            fechaFin: {
              type: 'string',
              format: 'date',
              description: 'Fecha de fin del curso',
              example: '2024-02-15'
            },
            horasAcreditadas: {
              type: 'number',
              description: 'Horas acreditadas del curso',
              minimum: 1,
              example: 40
            },
            tipoCapacitacion: {
              type: 'string',
              enum: ['curso', 'taller', 'diplomado', 'seminario', 'congreso', 'otro'],
              description: 'Tipo de capacitación',
              example: 'diplomado'
            },
            archivo: {
              type: 'string',
              description: 'URL o nombre del archivo de constancia',
              example: 'constancia_diplomado_metodologias.pdf'
            },
            cicloEscolar: {
              type: 'string',
              description: 'Ciclo escolar de registro',
              example: '2024-2025'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'validada', 'rechazada'],
              description: 'Estado de validación de la evidencia',
              default: 'pendiente',
              example: 'pendiente'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones del profesor',
              example: 'Curso muy útil para mejorar mis estrategias de enseñanza'
            },
            coordinadorValidador: {
              type: 'string',
              description: 'Nombre del coordinador que valida',
              example: 'Carlos Rodríguez'
            }
          }
        },
        RevisarPlaneacion: {
          type: 'object',
          required: ['estado', 'coordinadorRevisor'],
          properties: {
            estado: {
              type: 'string',
              enum: ['aprobado', 'rechazado', 'ajustes_solicitados'],
              description: 'Nuevo estado de la planeación',
              example: 'aprobado'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones del coordinador',
              example: 'Planeación completa y bien estructurada'
            },
            coordinadorRevisor: {
              type: 'string',
              description: 'Nombre del coordinador que revisa',
              example: 'María García'
            }
          }
        },
        ValidarEvidencia: {
          type: 'object',
          required: ['estado', 'coordinadorValidador'],
          properties: {
            estado: {
              type: 'string',
              enum: ['validada', 'rechazada'],
              description: 'Nuevo estado de la evidencia',
              example: 'validada'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones del coordinador',
              example: 'Constancia válida y horas acreditadas correctas'
            },
            coordinadorValidador: {
              type: 'string',
              description: 'Nombre del coordinador que valida',
              example: 'Carlos Rodríguez'
            }
          }
        },
        EstadisticasAvance: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total de avances registrados',
              example: 15
            },
            cumplido: {
              type: 'number',
              description: 'Avances cumplidos',
              example: 8
            },
            parcial: {
              type: 'number',
              description: 'Avances parcialmente cumplidos',
              example: 5
            },
            noCumplido: {
              type: 'number',
              description: 'Avances no cumplidos',
              example: 2
            },
            promedioPorcentaje: {
              type: 'number',
              description: 'Porcentaje promedio de avance',
              example: 75.5
            },
            porMateria: {
              type: 'object',
              description: 'Avances agrupados por materia'
            },
            porParcial: {
              type: 'object',
              description: 'Avances agrupados por parcial'
            }
          }
        },
        EstadisticasEvidencia: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total de evidencias registradas',
              example: 10
            },
            validadas: {
              type: 'number',
              description: 'Evidencias validadas',
              example: 7
            },
            pendientes: {
              type: 'number',
              description: 'Evidencias pendientes',
              example: 2
            },
            rechazadas: {
              type: 'number',
              description: 'Evidencias rechazadas',
              example: 1
            },
            totalHoras: {
              type: 'number',
              description: 'Total de horas acreditadas',
              example: 320
            },
            porTipo: {
              type: 'object',
              description: 'Evidencias agrupadas por tipo de capacitación'
            },
            porInstitucion: {
              type: 'object',
              description: 'Evidencias agrupadas por institución'
            }
          }
        },
        ReporteGeneral: {
          type: 'object',
          properties: {
            totalAvances: {
              type: 'number',
              description: 'Total de avances en el sistema',
              example: 45
            },
            totalEvidencias: {
              type: 'number',
              description: 'Total de evidencias en el sistema',
              example: 25
            },
            cumplimientoGeneral: {
              type: 'object',
              properties: {
                cumplido: { type: 'number', example: 25 },
                parcial: { type: 'number', example: 15 },
                noCumplido: { type: 'number', example: 5 }
              }
            },
            estadoEvidencias: {
              type: 'object',
              properties: {
                validadas: { type: 'number', example: 18 },
                pendientes: { type: 'number', example: 5 },
                rechazadas: { type: 'number', example: 2 }
              }
            },
            porProfesor: {
              type: 'object',
              description: 'Estadísticas por profesor'
            },
            totalHorasCapacitacion: {
              type: 'number',
              description: 'Total de horas de capacitación acreditadas',
              example: 850
            },
            promedioGlobal: {
              type: 'number',
              description: 'Porcentaje promedio global de avance',
              example: 78.3
            }
          }
        },
        DatosGraficas: {
          type: 'object',
          properties: {
            cumplimiento: {
              type: 'object',
              properties: {
                labels: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Cumplido', 'Parcial', 'No Cumplido']
                },
                data: {
                  type: 'array',
                  items: { type: 'number' },
                  example: [25, 15, 5]
                }
              }
            },
            porParcial: {
              type: 'object',
              properties: {
                labels: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Parcial 1', 'Parcial 2', 'Parcial 3']
                },
                data: {
                  type: 'array',
                  items: { type: 'number' },
                  example: [15, 20, 10]
                }
              }
            },
            evidenciasEstado: {
              type: 'object',
              properties: {
                labels: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Validadas', 'Pendientes', 'Rechazadas']
                },
                data: {
                  type: 'array',
                  items: { type: 'number' },
                  example: [18, 5, 2]
                }
              }
            },
            porcentajePromedio: {
              type: 'number',
              description: 'Porcentaje promedio de avance',
              example: 78
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Recurso no encontrado'
            },
            error: {
              type: 'string',
              description: 'Detalle del error (en desarrollo)',
              example: 'User not found'
            }
          }
        }
      },
      parameters: {
        PlaneacionId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID de la planeación'
        },
        AvanceId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID del avance'
        },
        EvidenciaId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID de la evidencia'
        }
      }
    },
    tags: [
      {
        name: 'Planeaciones',
        description: 'Endpoints para gestión de planeaciones didácticas'
      },
      {
        name: 'Avances',
        description: 'Endpoints para control de avances por parcial'
      },
      {
        name: 'Evidencias',
        description: 'Endpoints para gestión de evidencias de capacitación docente'
      }
    ]
  },
  apis: [
    './src/routes/*.js', // Rutas donde Swagger buscará documentación
  ],
};

// Exportar configuración lista para usar en server.js
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;