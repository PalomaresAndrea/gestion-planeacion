# Gestión de Planeación Académica

## Objetivo
El alumnado optimizará el proceso, desarrollo y liberación de componentes de software mediante la integración de metodologías, modelos, herramientas y servicios para la implementación de aplicaciones **WEB empresariales seguras**.

## Descripción
Aplicación web para instituciones educativas de nivel media superior, que permite:  
- Dar seguimiento al cumplimiento de la planeación didáctica de los docentes.  
- Controlar avances en cada parcial.  
- Registrar evidencias de capacitación docente durante el periodo académico.

## Funcionalidades Principales

| Funcionalidad | Descripción |
|---------------|------------|
| **Gestión de Planeación Didáctica** | Registro de planeaciones por materia y parcial, revisión y aprobación por coordinadores, historial de ciclos anteriores. |
| **Control de Avances por Parcial** | Registro de avances por parcial, indicador de cumplimiento, reportes visuales por profesor, materia y parcial. |
| **Evidencias de Curso y Capacitación** | Adjuntar PDF, imágenes o constancias de cursos, validación por coordinación académica, campos de información detallada. |
| **Reportes y Seguimiento Institucional** | Reportes globales de cumplimiento de planeaciones, avances por parcial, cursos acreditados; exportación en PDF o Excel. |

## Entregables del Proyecto

### I. Definición del Proceso de Desarrollo Web
| Tarea | Detalles |
|-------|---------|
| Metodología ágil | Selección y justificación (mínimo 5 puntos clave) |
| Esquema de pruebas | Pruebas unitarias y funcionales |
| Planeación del proceso | Roles, iteraciones, entregables, vinculación con Issues de GitHub |
| Arquitectura de software | Multicapa: presentación, lógica de negocio, datos, integración y pruebas |
| Diagrama de arquitectura | Capas, flujo de datos, patrones de diseño y entorno de ejecución |
| Patrones de diseño | Al menos 6 patrones (estructurales, creacionales, comportamiento y emergentes) |
| Frameworks | Justificación de al menos 2 frameworks FrontEnd y 2 BackEnd |
| Entorno de desarrollo | Node.js, React u otros |

### II. Control de Versiones
| Tarea | Detalles |
|-------|---------|
| Git y GitHub | Configuración de repositorio |
| Estrategias | Nomenclatura de ramas, acceso de usuarios, políticas de merge y Pull Request |
| Automatización | 3 GitHub Workflows (pruebas, modificaciones, aceptación de PR) |
| Demostración | Control de versiones desde CLI, IDE y GitHub |

### III. Integración de Componentes
| Tarea | Detalles |
|-------|---------|
| Seguridad | HTTPS, JWT, OAuth2 |
| APIs de terceros | Integración de al menos 3 (ej. Google Maps, PayPal, OpenWeather) |
| Web Services | Implementación de al menos 5 propios (REST o SOAP) |

### IV. Pruebas y Liberación
| Tarea | Detalles |
|-------|---------|
| Contenedores Docker | FrontEnd y BackEnd |
| Infraestructura en la nube | AWS, Azure, Google Cloud: servidores, BD, balanceador, dominio, SSL |
| Pruebas de software | Postman, Jest, JUnit |
| Escaneo de código | Cumplimiento de 10 principios de OWASP |

### V. Documentación y Entrega
| Sección | Detalles |
|---------|---------|
| Portada | Nombre del proyecto, alumno, carrera, materia, docente, fecha |
| Índice | Estructurado |
| Introducción | Descripción general, problemática y justificación de metodología ágil |
| Desarrollo | Metodología ágil, arquitectura, frameworks, control de versiones, planeación, diagrama |
| Integración | APIs, Web Services, seguridad y autenticación |
| Infraestructura y despliegue | Servidores, contenedores, nube, certificados, balanceo de cargas |
| Pruebas de software | Herramientas y resultados |
| Conclusiones | Aprendizajes obtenidos |
| Bibliografía | Bajo norma APA 7 |

## Entregables Finales
- Código fuente completo  
- Evidencias de funcionamiento (video corto o demo)  
- Contenedor o despliegue en la nube (Dockerfile, docker-compose o configuración cloud)

## Tecnologías
| Tipo | Herramientas |
|------|-------------|
| Frontend | React |
| Backend | Node.js, Express |
| Base de datos | MongoDB |
| Seguridad | JWT, OAuth2, HTTPS |
| Correo | SendGrid |
| Contenedores | Docker |
| Versionamiento | Git, GitHub |
| APIs de terceros | Google Maps, PayPal, OpenWeather |

## Instalación

### Backend
```bash
git clone <URL_DEL_REPOSITORIO>
cd backend
npm install

