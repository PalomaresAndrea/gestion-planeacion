import React, { useState, useEffect } from 'react'
import { reporteService } from '../services/api'
import '../styles/ReportesStyles.css'

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
        alert(`Funcionalidad de exportación ${formato.toUpperCase()} en desarrollo`)
      }
    } catch (error) {
      alert('Error al exportar reporte')
    }
  }

  const renderMetricCard = (title, value, subtitle, color = '#3498db') => (
    <div className="metric-card">
      <div className="metric-value" style={{ color }}>{value}</div>
      <div className="metric-title">{title}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  )

  const renderProgressBar = (percentage, label, color = '#3498db') => (
    <div className="progress-container">
      <div className="progress-label">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  )

  return (
    <div className="reportes-container">
      <header className="reportes-header">
        <h1> Reportes Institucionales</h1>
        <p>Análisis y estadísticas del sistema académico</p>
      </header>

      {/* Filtros y controles */}
      <div className="filters-card">
        <div className="filters-content">
          {/* Selector de pestañas */}
          <div className="tab-selector">
            <button
              onClick={() => setActiveTab('institucional')}
              className={`tab-button ${activeTab === 'institucional' ? 'active' : ''}`}
            >
               Institucional
            </button>
            <button
              onClick={() => setActiveTab('profesor')}
              className={`tab-button ${activeTab === 'profesor' ? 'active' : ''}`}
            >
               Por Profesor
            </button>
          </div>

          <div className="filters-grid">
            {/* Filtros comunes */}
            <input
              type="text"
              placeholder="Ciclo escolar (ej. 2024-2025)"
              value={filters.ciclo}
              onChange={(e) => setFilters(prev => ({ ...prev, ciclo: e.target.value }))}
              className="filter-input"
            />

            {/* Filtro específico para reporte por profesor */}
            {activeTab === 'profesor' && (
              <input
                type="text"
                placeholder="Nombre del profesor"
                value={filters.profesor}
                onChange={(e) => setFilters(prev => ({ ...prev, profesor: e.target.value }))}
                className="filter-input"
              />
            )}

            {/* Botones de acción */}
            <div className="actions-group">
              <button
                onClick={() => activeTab === 'institucional' ? loadReporteInstitucional() : loadReporteProfesor()}
                className="btn-primary"
              >
                 Actualizar
              </button>

              <select
                onChange={(e) => handleExport(e.target.value, activeTab)}
                className="export-select"
              >
                <option value=""> Exportar...</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando reporte...</p>
        </div>
      )}

      {/* Reporte Institucional */}
      {!loading && activeTab === 'institucional' && reporteInstitucional && (
        <div className="reporte-content">
          {/* Encabezado del reporte */}
          <div className="reporte-header">
            <div className="header-info">
              <h2>Reporte Institucional</h2>
              <p>
                Período: {reporteInstitucional.periodo} | 
                Generado: {new Date(reporteInstitucional.fechaGeneracion).toLocaleDateString()}
              </p>
            </div>
            <div className="header-badge">
              {reporteInstitucional.resumenGeneral.totalProfesores} PROFESORES
            </div>
          </div>

          {/* Métricas principales */}
          <div className="metrics-grid">
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
          <div className="stats-grid">
            {/* Planeaciones */}
            <div className="stat-card">
              <h3> Planeaciones</h3>
              {renderProgressBar(
                reporteInstitucional.planeaciones.porcentajeAprobacion,
                'Tasa de Aprobación',
                '#27ae60'
              )}
              <div className="stats-details">
                <div className="stat-item">
                  <span>Aprobadas:</span>
                  <strong>{reporteInstitucional.planeaciones.aprobadas}</strong>
                </div>
                <div className="stat-item">
                  <span>Pendientes:</span>
                  <strong>{reporteInstitucional.planeaciones.pendientes}</strong>
                </div>
                <div className="stat-item">
                  <span>Rechazadas:</span>
                  <strong>{reporteInstitucional.planeaciones.rechazadas}</strong>
                </div>
                <div className="stat-item">
                  <span>Ajustes:</span>
                  <strong>{reporteInstitucional.planeaciones.ajustesSolicitados}</strong>
                </div>
              </div>
            </div>

            {/* Avances */}
            <div className="stat-card">
              <h3> Avances</h3>
              {renderProgressBar(
                reporteInstitucional.avances.porcentajeCumplimiento,
                'Cumplimiento General',
                '#3498db'
              )}
              <div className="stats-details">
                <div className="stat-item">
                  <span>Cumplidos:</span>
                  <strong>{reporteInstitucional.avances.cumplido}</strong>
                </div>
                <div className="stat-item">
                  <span>Parciales:</span>
                  <strong>{reporteInstitucional.avances.parcial}</strong>
                </div>
                <div className="stat-item">
                  <span>No cumplidos:</span>
                  <strong>{reporteInstitucional.avances.noCumplido}</strong>
                </div>
                <div className="stat-item">
                  <span>Promedio:</span>
                  <strong>{reporteInstitucional.avances.porcentajePromedio}%</strong>
                </div>
              </div>
            </div>

            {/* Capacitación */}
            <div className="stat-card">
              <h3> Capacitación</h3>
              <div className="progress-container">
                <div className="progress-label">
                  <span>Validación de Evidencias</span>
                  <span>{((reporteInstitucional.capacitacionDocente.cursosValidadas / reporteInstitucional.capacitacionDocente.totalCursos) * 100).toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${(reporteInstitucional.capacitacionDocente.cursosValidadas / reporteInstitucional.capacitacionDocente.totalCursos) * 100}%`,
                      backgroundColor: '#9b59b6'
                    }}
                  ></div>
                </div>
              </div>
              <div className="stats-details">
                <div className="stat-item">
                  <span>Validadas:</span>
                  <strong>{reporteInstitucional.capacitacionDocente.cursosValidadas}</strong>
                </div>
                <div className="stat-item">
                  <span>Pendientes:</span>
                  <strong>{reporteInstitucional.capacitacionDocente.cursosPendientes}</strong>
                </div>
                <div className="stat-item">
                  <span>Rechazadas:</span>
                  <strong>{reporteInstitucional.capacitacionDocente.cursosRechazadas}</strong>
                </div>
                <div className="stat-item">
                  <span>Promedio:</span>
                  <strong>{reporteInstitucional.capacitacionDocente.promedioHorasPorProfesor}h</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución por parcial */}
          <div className="distribution-card">
            <h3> Distribución por Parcial</h3>
            <div className="distribution-grid">
              {[1, 2, 3].map(parcial => (
                <div key={parcial} className="period-card">
                  <div className="period-title">Parcial {parcial}</div>
                  <div className="period-stats">
                    <div className="period-stat">
                      <div className="stat-value" style={{ color: '#e74c3c' }}>
                        {reporteInstitucional.porParcial[parcial]?.planeaciones || 0}
                      </div>
                      <div className="stat-label">Planeaciones</div>
                    </div>
                    <div className="period-stat">
                      <div className="stat-value" style={{ color: '#3498db' }}>
                        {reporteInstitucional.porParcial[parcial]?.avances || 0}
                      </div>
                      <div className="stat-label">Avances</div>
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
        <div className="reporte-content">
          {/* Encabezado del reporte */}
          <div className="reporte-header">
            <div className="header-info">
              <h2>Reporte del Profesor: {reporteProfesor.profesor}</h2>
              <p>
                Período: {reporteProfesor.periodo} | 
                Generado: {new Date(reporteProfesor.fechaGeneracion).toLocaleDateString()}
              </p>
            </div>
            <div className="header-badge profesor-badge">
              {reporteProfesor.resumen.avancesRegistrados} AVANCES
            </div>
          </div>

          {/* Resumen general */}
          <div className="metrics-grid">
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
          <div className="details-grid">
            {/* Planeaciones */}
            <div className="detail-card">
              <h3> Planeaciones</h3>
              <div className="detail-list">
                {Object.entries(reporteProfesor.detallePlaneaciones.porEstado).map(([estado, count]) => (
                  <div key={estado} className="detail-item">
                    <span className="detail-label">{estado.replace('_', ' ')}</span>
                    <strong className="detail-value">{count}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Avances */}
            <div className="detail-card">
              <h3> Avances</h3>
              <div className="detail-list">
                {Object.entries(reporteProfesor.detalleAvances.porCumplimiento).map(([cumplimiento, count]) => (
                  <div key={cumplimiento} className="detail-item">
                    <span className="detail-label">{cumplimiento}</span>
                    <strong className="detail-value">{count}</strong>
                  </div>
                ))}
              </div>
              <div className="promedio-section">
                <strong>Promedio: {reporteProfesor.detalleAvances.porcentajePromedio}%</strong>
              </div>
            </div>

            {/* Capacitación */}
            <div className="detail-card">
              <h3> Capacitación</h3>
              <div className="capacitacion-details">
                <div className="capacitacion-section">
                  <strong>Por Tipo:</strong>
                  {Object.entries(reporteProfesor.detalleCapacitacion.porTipo).map(([tipo, count]) => (
                    <div key={tipo} className="capacitacion-item">
                      <span className="capacitacion-label">{tipo}</span>
                      <strong className="capacitacion-value">{count}</strong>
                    </div>
                  ))}
                </div>
                <div className="capacitacion-section">
                  <strong>Por Institución:</strong>
                  {Object.entries(reporteProfesor.detalleCapacitacion.porInstitucion).map(([institucion, count]) => (
                    <div key={institucion} className="capacitacion-item">
                      <span className="capacitacion-label">{institucion}</span>
                      <strong className="capacitacion-value">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && activeTab === 'profesor' && !reporteProfesor && (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>Reporte por Profesor</h3>
          <p>Ingresa el nombre del profesor y haz clic en "Actualizar" para generar el reporte</p>
          <button
            onClick={loadReporteProfesor}
            className="btn-primary"
          >
            Generar Reporte
          </button>
        </div>
      )}
    </div>
  )
}

export default ReportesPage