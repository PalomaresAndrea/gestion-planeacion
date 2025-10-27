import React, { useState, useEffect } from 'react'
import { reporteService, planeacionService, avanceService, evidenciaService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/DashboardStyles.css'

const Dashboard = () => {
  const [reporte, setReporte] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [planeacionesData, setPlaneacionesData] = useState([])
  const [avancesData, setAvancesData] = useState([])
  
  const { user, isCoordinador, isAdmin, isProfesor } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'planeaciones') {
      loadPlaneacionesData()
    } else if (activeTab === 'avances') {
      loadAvancesData()
    }
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      if (isCoordinador() || isAdmin()) {
        // Dashboard para coordinadores y admin
        const [reporteRes, planeacionesRes, avancesRes, evidenciasRes] = await Promise.all([
          reporteService.getInstitucional(),
          planeacionService.getAll(),
          avanceService.getAll(),
          evidenciaService.getAll()
        ])
        
        setReporte(reporteRes.data)
        
        setStats({
          planeacionesPendientes: planeacionesRes.data.filter(p => p.estado === 'pendiente').length,
          avancesRecientes: avancesRes.data.slice(0, 5),
          evidenciasRecientes: evidenciasRes.data.slice(0, 5)
        })
      } else if (isProfesor()) {
        // Dashboard para profesores
        const [planeacionesRes, avancesRes, evidenciasRes] = await Promise.all([
          planeacionService.getAll(),
          avanceService.getAll(),
          evidenciaService.getAll()
        ])
        
        const misPlaneaciones = planeacionesRes.data
        const misAvances = avancesRes.data
        const misEvidencias = evidenciasRes.data
        
        setStats({
          totalPlaneaciones: misPlaneaciones.length,
          planeacionesPendientes: misPlaneaciones.filter(p => p.estado === 'pendiente').length,
          totalAvances: misAvances.length,
          avancesCumplidos: misAvances.filter(a => a.cumplimiento === 'cumplido').length,
          totalEvidencias: misEvidencias.length,
          evidenciasValidadas: misEvidencias.filter(e => e.estado === 'validada').length,
          avancesRecientes: misAvances.slice(0, 5),
          planeacionesRecientes: misPlaneaciones.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPlaneacionesData = async () => {
    try {
      const response = await planeacionService.getAll()
      // Si es profesor, ya viene filtrado por el backend
      setPlaneacionesData(response.data)
    } catch (error) {
      console.error('Error cargando planeaciones:', error)
    }
  }

  const loadAvancesData = async () => {
    try {
      const response = await avanceService.getAll()
      // Si es profesor, ya viene filtrado por el backend
      setAvancesData(response.data)
    } catch (error) {
      console.error('Error cargando avances:', error)
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      aprobado: { bg: '#e8f8ec', color: '#1e7e34' },
      pendiente: { bg: '#fff8e1', color: '#a68b00' },
      rechazado: { bg: '#fdecea', color: '#a71d2a' },
      ajustes_solicitados: { bg: '#e3f2fd', color: '#1565c0' }
    }
    return colors[estado] || colors.pendiente
  }

  const getCumplimientoColor = (cumplimiento) => {
    const colors = {
      cumplido: { bg: '#e8f8ec', color: '#1e7e34' },
      parcial: { bg: '#fff8e1', color: '#a68b00' },
      'no cumplido': { bg: '#fdecea', color: '#a71d2a' }
    }
    return colors[cumplimiento] || colors.parcial
  }

  const getEvidenciaColor = (estado) => {
    const colors = {
      validada: { bg: '#e8f8ec', color: '#1e7e34' },
      pendiente: { bg: '#fff8e1', color: '#a68b00' },
      rechazada: { bg: '#fdecea', color: '#a71d2a' }
    }
    return colors[estado] || colors.pendiente
  }

  // Componente de tarjeta reutilizable
  const MetricCard = ({ icon, title, value, subtitle, color, children }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ backgroundColor: color + '20', color }}>
          {icon}
        </div>
        <div className="metric-info">
          <h3>{title}</h3>
          <div className="metric-value" style={{ color }}>{value}</div>
          {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )

  // Componente de barra de progreso
  const ProgressBar = ({ percentage, color, label }) => (
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

  // Renderizar dashboard según el rol
  const renderDashboardByRole = () => {
    if (isCoordinador() || isAdmin()) {
      return renderAdminDashboard()
    } else if (isProfesor()) {
      return renderProfesorDashboard()
    }
    return null
  }

  // Dashboard para coordinadores y admin
  const renderAdminDashboard = () => (
    <>
      {activeTab === 'general' && (
        <>
          {/* Tarjetas de métricas principales */}
          <div className="metrics-grid">
            <MetricCard
              icon="👨‍🏫"
              title="Profesores Activos"
              value={reporte?.resumenGeneral?.totalProfesores || 0}
              subtitle="Total en el sistema"
              color="#3498db"
            />

            <MetricCard
              icon="📋"
              title="Planeaciones"
              value={reporte?.resumenGeneral?.totalPlaneaciones || 0}
              subtitle={`${stats.planeacionesPendientes || 0} pendientes`}
              color="#28a745"
            />

            <MetricCard
              icon="📊"
              title="Avances Registrados"
              value={reporte?.resumenGeneral?.totalAvances || 0}
              subtitle="Seguimiento académico"
              color="#e74c3c"
            />

            <MetricCard
              icon="📁"
              title="Evidencias"
              value={reporte?.resumenGeneral?.totalEvidencias || 0}
              subtitle="Documentación cargada"
              color="#9b59b6"
            />
          </div>

          {/* Sección de rendimiento */}
          <div className="performance-section">
            <h2>📈 Rendimiento General</h2>
            <div className="performance-grid">
              <MetricCard
                icon="✅"
                title="Aprobación de Planeaciones"
                value={`${reporte?.planeaciones?.porcentajeAprobacion || 0}%`}
                color="#28a745"
              >
                <div className="progress-stack">
                  <ProgressBar 
                    percentage={(reporte?.planeaciones?.aprobadas || 0) / (reporte?.resumenGeneral?.totalPlaneaciones || 1) * 100} 
                    color="#28a745" 
                    label="Aprobadas" 
                  />
                  <ProgressBar 
                    percentage={(reporte?.planeaciones?.pendientes || 0) / (reporte?.resumenGeneral?.totalPlaneaciones || 1) * 100} 
                    color="#ffc107" 
                    label="Pendientes" 
                  />
                  <ProgressBar 
                    percentage={(reporte?.planeaciones?.rechazadas || 0) / (reporte?.resumenGeneral?.totalPlaneaciones || 1) * 100} 
                    color="#dc3545" 
                    label="Rechazadas" 
                  />
                </div>
              </MetricCard>

              <MetricCard
                icon="🎯"
                title="Cumplimiento de Avances"
                value={`${reporte?.avances?.porcentajeCumplimiento || 0}%`}
                color="#3498db"
              >
                <div className="status-grid">
                  <div className="status-item">
                    <div className="status-dot" style={{backgroundColor: '#28a745'}}></div>
                    <span>Cumplidos: {reporte?.avances?.cumplido || 0}</span>
                  </div>
                  <div className="status-item">
                    <div className="status-dot" style={{backgroundColor: '#ffc107'}}></div>
                    <span>Parciales: {reporte?.avances?.parcial || 0}</span>
                  </div>
                  <div className="status-item">
                    <div className="status-dot" style={{backgroundColor: '#dc3545'}}></div>
                    <span>No cumplidos: {reporte?.avances?.noCumplido || 0}</span>
                  </div>
                </div>
              </MetricCard>

              <MetricCard
                icon="🎓"
                title="Capacitación Docente"
                value={`${reporte?.capacitacionDocente?.totalHorasAcreditadas || 0}h`}
                subtitle={`${reporte?.capacitacionDocente?.totalCursos || 0} cursos`}
                color="#9b59b6"
              >
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Cursos validados:</span>
                    <strong>{reporte?.capacitacionDocente?.cursosValidadas || 0}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Promedio por profesor:</span>
                    <strong>{reporte?.capacitacionDocente?.promedioHorasPorProfesor || 0}h</strong>
                  </div>
                </div>
              </MetricCard>
            </div>
          </div>

          {/* Distribución por parcial */}
          <div className="distribution-section">
            <h2>📅 Distribución por Periodos Académicos</h2>
            <div className="distribution-grid">
              {[1, 2, 3].map(parcial => (
                <div key={parcial} className="period-card">
                  <h3>Parcial {parcial}</h3>
                  <div className="period-stats">
                    <div className="period-stat">
                      <span className="stat-label">Planeaciones</span>
                      <span className="stat-value">
                        {reporte?.porParcial?.[parcial]?.planeaciones || 0}
                      </span>
                    </div>
                    <div className="period-stat">
                      <span className="stat-label">Avances</span>
                      <span className="stat-value">
                        {reporte?.porParcial?.[parcial]?.avances || 0}
                      </span>
                    </div>
                    <div className="period-stat">
                      <span className="stat-label">Evidencias</span>
                      <span className="stat-value">
                        {reporte?.porParcial?.[parcial]?.evidencias || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Pestañas de Planeaciones y Avances (compartidas) */}
      {renderPlaneacionesTab()}
      {renderAvancesTab()}
    </>
  )

  // Dashboard para profesores
  const renderProfesorDashboard = () => (
    <>
      {activeTab === 'general' && (
        <>
          {/* Tarjetas de métricas personales */}
          <div className="metrics-grid">
            <MetricCard
              icon="📋"
              title="Mis Planeaciones"
              value={stats.totalPlaneaciones || 0}
              subtitle={`${stats.planeacionesPendientes || 0} pendientes`}
              color="#28a745"
            />

            <MetricCard
              icon="📊"
              title="Mis Avances"
              value={stats.totalAvances || 0}
              subtitle={`${stats.avancesCumplidos || 0} cumplidos`}
              color="#3498db"
            />

            <MetricCard
              icon="📁"
              title="Mis Evidencias"
              value={stats.totalEvidencias || 0}
              subtitle={`${stats.evidenciasValidadas || 0} validadas`}
              color="#9b59b6"
            />

            <MetricCard
              icon="👤"
              title="Mi Perfil"
              value={user?.nombre || 'Profesor'}
              subtitle={user?.email}
              color="#e74c3c"
            />
          </div>

          {/* Actividad reciente */}
          <div className="recent-section">
            <h2>📝 Mi Actividad Reciente</h2>
            <div className="recent-grid">
              <div className="recent-column">
                <h3>Últimas Planeaciones</h3>
                <div className="recent-items">
                  {stats.planeacionesRecientes?.map((planeacion) => {
                    const estadoColor = getEstadoColor(planeacion.estado)
                    return (
                      <div key={planeacion._id} className="recent-item">
                        <div className="recent-item-header">
                          <strong>{planeacion.materia}</strong>
                          <span 
                            className="estado-badge"
                            style={{
                              background: estadoColor.bg,
                              color: estadoColor.color
                            }}
                          >
                            {planeacion.estado}
                          </span>
                        </div>
                        <p>Parcial {planeacion.parcial}</p>
                        <small>{new Date(planeacion.fechaCreacion).toLocaleDateString()}</small>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="recent-column">
                <h3>Últimos Avances</h3>
                <div className="recent-items">
                  {stats.avancesRecientes?.map((avance) => {
                    const cumplimientoColor = getCumplimientoColor(avance.cumplimiento)
                    return (
                      <div key={avance._id} className="recent-item">
                        <div className="recent-item-header">
                          <strong>{avance.materia}</strong>
                          <span 
                            className="estado-badge"
                            style={{
                              background: cumplimientoColor.bg,
                              color: cumplimientoColor.color
                            }}
                          >
                            {avance.cumplimiento}
                          </span>
                        </div>
                        <p>{avance.porcentajeAvance}% completado</p>
                        <small>Parcial {avance.parcial}</small>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pestañas de Planeaciones y Avances (compartidas) */}
      {renderPlaneacionesTab()}
      {renderAvancesTab()}
    </>
  )

  // Pestaña de Planeaciones (compartida)
  const renderPlaneacionesTab = () => (
    activeTab === 'planeaciones' && (
      <div className="tab-content">
        <div className="tab-header">
          <h2>📋 {isProfesor() ? 'Mis Planeaciones' : 'Gestión de Planeaciones'}</h2>
          <p>
            {isProfesor() 
              ? 'Resumen y estado de mis planeaciones didácticas' 
              : 'Resumen y estado actual de las planeaciones didácticas'
            }
          </p>
        </div>

        <div className="metrics-grid">
          <MetricCard
            icon="📋"
            title="Total"
            value={planeacionesData.length}
            subtitle={isProfesor() ? "Mis planeaciones" : "Registradas en el sistema"}
            color="#3498db"
          />

          <MetricCard
            icon="✅"
            title="Aprobadas"
            value={planeacionesData.filter(p => p.estado === 'aprobado').length}
            subtitle="Planeaciones validadas"
            color="#28a745"
          />

          <MetricCard
            icon="⏳"
            title="Pendientes"
            value={planeacionesData.filter(p => p.estado === 'pendiente').length}
            subtitle="En espera de revisión"
            color="#ffc107"
          />

          <MetricCard
            icon="❌"
            title="Rechazadas"
            value={planeacionesData.filter(p => p.estado === 'rechazado').length}
            subtitle="Requieren ajustes"
            color="#dc3545"
          />
        </div>

        <div className="recent-section">
          <h3>📄 {isProfesor() ? 'Mis Planeaciones' : 'Planeaciones Recientes'}</h3>
          <div className="items-grid">
            {planeacionesData.slice(0, 6).map((planeacion) => {
              const estadoColor = getEstadoColor(planeacion.estado)
              return (
                <div key={planeacion._id} className="item-card">
                  <div className="item-header">
                    <h4>{planeacion.materia} - Parcial {planeacion.parcial}</h4>
                    <span 
                      className="estado-badge"
                      style={{
                        background: estadoColor.bg,
                        color: estadoColor.color
                      }}
                    >
                      {planeacion.estado.toUpperCase()}
                    </span>
                  </div>
                  <div className="item-details">
                    <p><strong>Profesor:</strong> {planeacion.profesor}</p>
                    <p><strong>Fecha:</strong> {new Date(planeacion.fechaCreacion).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  )

  // Pestaña de Avances (compartida)
  const renderAvancesTab = () => (
    activeTab === 'avances' && (
      <div className="tab-content">
        <div className="tab-header">
          <h2>📊 {isProfesor() ? 'Mis Avances' : 'Seguimiento de Avances'}</h2>
          <p>
            {isProfesor() 
              ? 'Monitoreo de mi progreso académico' 
              : 'Monitoreo del progreso académico por parcial'
            }
          </p>
        </div>

        <div className="metrics-grid">
          <MetricCard
            icon="📊"
            title="Total"
            value={avancesData.length}
            subtitle={isProfesor() ? "Mis registros" : "Registros de seguimiento"}
            color="#3498db"
          />

          <MetricCard
            icon="✅"
            title="Cumplidos"
            value={avancesData.filter(a => a.cumplimiento === 'cumplido').length}
            subtitle="Avances completados"
            color="#28a745"
          />

          <MetricCard
            icon="⏳"
            title="Parciales"
            value={avancesData.filter(a => a.cumplimiento === 'parcial').length}
            subtitle="En progreso"
            color="#ffc107"
          />

          <MetricCard
            icon="❌"
            title="No Cumplidos"
            value={avancesData.filter(a => a.cumplimiento === 'no cumplido').length}
            subtitle="Requieren atención"
            color="#dc3545"
          />
        </div>

        <div className="recent-section">
          <h3>📈 {isProfesor() ? 'Mis Avances' : 'Avances Recientes'}</h3>
          <div className="items-grid">
            {avancesData.slice(0, 6).map((avance) => {
              const cumplimientoColor = getCumplimientoColor(avance.cumplimiento)
              return (
                <div key={avance._id} className="item-card">
                  <div className="item-header">
                    <h4>{avance.materia} - Parcial {avance.parcial}</h4>
                    <span 
                      className="estado-badge"
                      style={{
                        background: cumplimientoColor.bg,
                        color: cumplimientoColor.color
                      }}
                    >
                      {avance.cumplimiento.toUpperCase()}
                    </span>
                  </div>
                  <div className="item-details">
                    <p><strong>Profesor:</strong> {avance.profesor}</p>
                    <p><strong>Avance:</strong> {avance.porcentajeAvance}%</p>
                    <p><strong>Temas cubiertos:</strong> {avance.temasCubiertos.length}/{avance.temasPlaneados.length}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Cargando información del dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎓 Panel de Control {isProfesor() ? 'Docente' : 'Institucional'}</h1>
          <p>
            {isProfesor() 
              ? `Bienvenido/a ${user?.nombre || 'Profesor'} - Vista general de tu actividad académica`
              : 'Vista general del sistema académico y métricas clave'
            }
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={loadDashboardData}>
            🔄 Actualizar
          </button>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          📊 Vista General
        </button>
        <button 
          className={`tab-button ${activeTab === 'planeaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('planeaciones')}
        >
          📋 {isProfesor() ? 'Mis Planeaciones' : 'Planeaciones'}
        </button>
        <button 
          className={`tab-button ${activeTab === 'avances' ? 'active' : ''}`}
          onClick={() => setActiveTab('avances')}
        >
          📈 {isProfesor() ? 'Mis Avances' : 'Avances'}
        </button>
      </nav>

      {/* Contenido del dashboard según rol */}
      {renderDashboardByRole()}
    </div>
  )
}

export default Dashboard