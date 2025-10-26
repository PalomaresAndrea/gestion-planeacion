import React, { useState, useEffect } from 'react'
import { reporteService } from '../services/api'

const ReportesPage = () => {
  const [reporteInstitucional, setReporteInstitucional] = useState(null)
  const [reporteProfesor, setReporteProfesor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('institucional')
  const [filters, setFilters] = useState({
    ciclo: '',
    profesor: ''
  })

  useEffect(() => {
    if (activeTab === 'institucional') {
      loadReporteInstitucional()
    }
  }, [activeTab])

  const loadReporteInstitucional = async () => {
    setLoading(true)
    try {
      const response = await reporteService.getInstitucional(filters.ciclo)
      setReporteInstitucional(response.data)
    } catch (error) {
      console.error('Error cargando reporte institucional:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReporteProfesor = async () => {
    if (!filters.profesor) {
      alert('Por favor ingresa el nombre del profesor')
      return
    }

    setLoading(true)
    try {
      const response = await reporteService.getPorProfesor(filters.profesor, filters.ciclo)
      setReporteProfesor(response.data)
    } catch (error) {
      console.error('Error cargando reporte por profesor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (formato, tipo) => {
    try {
      const response = await reporteService.exportar(
        formato, 
        tipo, 
        filters.ciclo, 
        tipo === 'profesor' ? filters.profesor : undefined
      )
      
      if (response.data.message) {
        alert(response.data.message)
      } else {
        // Aquí manejarías la descarga del archivo real
        alert(`Funcionalidad de exportación ${formato.toUpperCase()} en desarrollo`)
      }
    } catch (error) {
      alert('Error al exportar reporte')
    }
  }

  const renderMetricCard = (title, value, subtitle, color = '#3498db') => (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color, marginBottom: '10px' }}>
        {value}
      </div>
      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#2c3e50' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
        {subtitle}
      </div>
    </div>
  )

  const renderProgressBar = (percentage, label, color = '#3498db') => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontWeight: 'bold' }}>{label}</span>
        <span style={{ color: '#7f8c8d' }}>{percentage}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: '#ecf0f1',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>
    </div>
  )

  return (
    <div>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Reportes Institucionales</h1>
        <p style={{ margin: 0, color: '#7f8c8d' }}>Análisis y estadísticas del sistema académico</p>
      </header>

      {/* Filtros y controles */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Selector de pestañas */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('institucional')}
              style={{
                background: activeTab === 'institucional' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'institucional' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📊 Institucional
            </button>
            <button
              onClick={() => setActiveTab('profesor')}
              style={{
                background: activeTab === 'profesor' ? '#3498db' : '#ecf0f1',
                color: activeTab === 'profesor' ? 'white' : '#2c3e50',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              👨‍🏫 Por Profesor
            </button>
          </div>

          {/* Filtros comunes */}
          <input
            type="text"
            placeholder="Ciclo escolar (ej. 2024-2025)"
            value={filters.ciclo}
            onChange={(e) => setFilters(prev => ({ ...prev, ciclo: e.target.value }))}
            style={{ 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              minWidth: '200px'
            }}
          />

          {/* Filtro específico para reporte por profesor */}
          {activeTab === 'profesor' && (
            <input
              type="text"
              placeholder="Nombre del profesor"
              value={filters.profesor}
              onChange={(e) => setFilters(prev => ({ ...prev, profesor: e.target.value }))}
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minWidth: '200px'
              }}
            />
          )}

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button
              onClick={() => activeTab === 'institucional' ? loadReporteInstitucional() : loadReporteProfesor()}
              style={{
                background: '#27ae60',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Actualizar
            </button>

            <select
              onChange={(e) => handleExport(e.target.value, activeTab)}
              style={{ 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                background: 'white'
              }}
            >
              <option value="">📥 Exportar...</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div>Cargando reporte...</div>
        </div>
      )}

      {/* Reporte Institucional */}
      {!loading && activeTab === 'institucional' && reporteInstitucional && (
        <div>
          {/* Encabezado del reporte */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                  Reporte Institucional
                </h2>
                <p style={{ margin: 0, color: '#7f8c8d' }}>
                  Período: {reporteInstitucional.periodo} | 
                  Generado: {new Date(reporteInstitucional.fechaGeneracion).toLocaleDateString()}
                </p>
              </div>
              <div style={{
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                borderRadius: '20px',
                fontWeight: 'bold'
              }}>
                {reporteInstitucional.resumenGeneral.totalProfesores} PROFESORES
              </div>
            </div>
          </div>

          {/* Métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {renderMetricCard(
              'Planeaciones',
              reporteInstitucional.resumenGeneral.totalPlaneaciones,
              'Total registradas',
              '#e74c3c'
            )}
            {renderMetricCard(
              'Avances',
              reporteInstitucional.resumenGeneral.totalAvances,
              'Seguimientos',
              '#3498db'
            )}
            {renderMetricCard(
              'Evidencias',
              reporteInstitucional.resumenGeneral.totalEvidencias,
              'Cursos y talleres',
              '#9b59b6'
            )}
            {renderMetricCard(
              'Horas Capacitación',
              reporteInstitucional.capacitacionDocente.totalHorasAcreditadas,
              'Total acreditadas',
              '#27ae60'
            )}
          </div>

          {/* Estadísticas detalladas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Planeaciones */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📝 Planeaciones</h3>
              {renderProgressBar(
                reporteInstitucional.planeaciones.porcentajeAprobacion,
                'Tasa de Aprobación',
                '#27ae60'
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                <div>Aprobadas: <strong>{reporteInstitucional.planeaciones.aprobadas}</strong></div>
                <div>Pendientes: <strong>{reporteInstitucional.planeaciones.pendientes}</strong></div>
                <div>Rechazadas: <strong>{reporteInstitucional.planeaciones.rechazadas}</strong></div>
                <div>Ajustes: <strong>{reporteInstitucional.planeaciones.ajustesSolicitados}</strong></div>
              </div>
            </div>

            {/* Avances */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📈 Avances</h3>
              {renderProgressBar(
                reporteInstitucional.avances.porcentajeCumplimiento,
                'Cumplimiento General',
                '#3498db'
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                <div>Cumplidos: <strong>{reporteInstitucional.avances.cumplido}</strong></div>
                <div>Parciales: <strong>{reporteInstitucional.avances.parcial}</strong></div>
                <div>No cumplidos: <strong>{reporteInstitucional.avances.noCumplido}</strong></div>
                <div>Promedio: <strong>{reporteInstitucional.avances.porcentajePromedio}%</strong></div>
              </div>
            </div>

            {/* Capacitación */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>🎓 Capacitación</h3>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Validación de Evidencias</span>
                  <span>{((reporteInstitucional.capacitacionDocente.cursosValidadas / reporteInstitucional.capacitacionDocente.totalCursos) * 100).toFixed(1)}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#ecf0f1',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(reporteInstitucional.capacitacionDocente.cursosValidadas / reporteInstitucional.capacitacionDocente.totalCursos) * 100}%`,
                    height: '100%',
                    background: '#9b59b6',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                <div>Validadas: <strong>{reporteInstitucional.capacitacionDocente.cursosValidadas}</strong></div>
                <div>Pendientes: <strong>{reporteInstitucional.capacitacionDocente.cursosPendientes}</strong></div>
                <div>Rechazadas: <strong>{reporteInstitucional.capacitacionDocente.cursosRechazadas}</strong></div>
                <div>Promedio: <strong>{reporteInstitucional.capacitacionDocente.promedioHorasPorProfesor}h</strong></div>
              </div>
            </div>
          </div>

          {/* Distribución por parcial */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>📅 Distribución por Parcial</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              textAlign: 'center'
            }}>
              {[1, 2, 3].map(parcial => (
                <div key={parcial}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#e74c3c',
                    marginBottom: '10px'
                  }}>
                    Parcial {parcial}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                        {reporteInstitucional.porParcial[parcial]?.planeaciones || 0}
                      </div>
                      <div>Planeaciones</div>
                    </div>
                    <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 'bold', color: '#3498db' }}>
                        {reporteInstitucional.porParcial[parcial]?.avances || 0}
                      </div>
                      <div>Avances</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reporte por Profesor */}
      {!loading && activeTab === 'profesor' && reporteProfesor && (
        <div>
          {/* Encabezado del reporte */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                  Reporte del Profesor: {reporteProfesor.profesor}
                </h2>
                <p style={{ margin: 0, color: '#7f8c8d' }}>
                  Período: {reporteProfesor.periodo} | 
                  Generado: {new Date(reporteProfesor.fechaGeneracion).toLocaleDateString()}
                </p>
              </div>
              <div style={{
                padding: '10px 20px',
                background: '#9b59b6',
                color: 'white',
                borderRadius: '20px',
                fontWeight: 'bold'
              }}>
                {reporteProfesor.resumen.avancesRegistrados} AVANCES
              </div>
            </div>
          </div>

          {/* Resumen general */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {renderMetricCard(
              'Planeaciones',
              reporteProfesor.resumen.planeacionesRegistradas,
              'Registradas',
              '#e74c3c'
            )}
            {renderMetricCard(
              'Avances',
              reporteProfesor.resumen.avancesRegistrados,
              'Registrados',
              '#3498db'
            )}
            {renderMetricCard(
              'Cursos',
              reporteProfesor.resumen.cursosTomados,
              'Tomados',
              '#9b59b6'
            )}
            {renderMetricCard(
              'Horas',
              reporteProfesor.detalleCapacitacion.totalHoras,
              'Capacitación',
              '#27ae60'
            )}
          </div>

          {/* Detalles por área */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Planeaciones */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📝 Planeaciones</h3>
              {Object.entries(reporteProfesor.detallePlaneaciones.porEstado).map(([estado, count]) => (
                <div key={estado} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #ecf0f1'
                }}>
                  <span style={{ textTransform: 'capitalize' }}>{estado.replace('_', ' ')}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            {/* Avances */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📈 Avances</h3>
              {Object.entries(reporteProfesor.detalleAvances.porCumplimiento).map(([cumplimiento, count]) => (
                <div key={cumplimiento} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #ecf0f1'
                }}>
                  <span style={{ textTransform: 'capitalize' }}>{cumplimiento}</span>
                  <strong>{count}</strong>
                </div>
              ))}
              <div style={{ 
                marginTop: '10px', 
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <strong>Promedio: {reporteProfesor.detalleAvances.porcentajePromedio}%</strong>
              </div>
            </div>

            {/* Capacitación */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>🎓 Capacitación</h3>
              <div style={{ marginBottom: '15px' }}>
                <strong>Por Tipo:</strong>
                {Object.entries(reporteProfesor.detalleCapacitacion.porTipo).map(([tipo, count]) => (
                  <div key={tipo} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '5px 0'
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>{tipo}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
              <div>
                <strong>Por Institución:</strong>
                {Object.entries(reporteProfesor.detalleCapacitacion.porInstitucion).map(([institucion, count]) => (
                  <div key={institucion} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '5px 0'
                  }}>
                    <span>{institucion}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && activeTab === 'profesor' && !reporteProfesor && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👨‍🏫</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
            Reporte por Profesor
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#7f8c8d' }}>
            Ingresa el nombre del profesor y haz clic en "Actualizar" para generar el reporte
          </p>
          <button
            onClick={loadReporteProfesor}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Generar Reporte
          </button>
        </div>
      )}
    </div>
  )
}

export default ReportesPage