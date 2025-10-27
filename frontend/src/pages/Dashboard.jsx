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
  const [showProfileModal, setShowProfileModal] = useState(false)
  
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
      aprobado: { bg: '#e8f8ec', color: '#1e7e34', border: '#c8e6c9' },
      pendiente: { bg: '#fff8e1', color: '#a68b00', border: '#ffeaa7' },
      rechazado: { bg: '#fdecea', color: '#a71d2a', border: '#f5c6cb' },
      ajustes_solicitados: { bg: '#e3f2fd', color: '#1565c0', border: '#bbdefb' }
    }
    return colors[estado] || colors.pendiente
  }

  const getCumplimientoColor = (cumplimiento) => {
    const colors = {
      cumplido: { bg: '#e8f8ec', color: '#1e7e34', border: '#c8e6c9' },
      parcial: { bg: '#fff8e1', color: '#a68b00', border: '#ffeaa7' },
      'no cumplido': { bg: '#fdecea', color: '#a71d2a', border: '#f5c6cb' }
    }
    return colors[cumplimiento] || colors.parcial
  }

  const getEvidenciaColor = (estado) => {
    const colors = {
      validada: { bg: '#e8f8ec', color: '#1e7e34', border: '#c8e6c9' },
      pendiente: { bg: '#fff8e1', color: '#a68b00', border: '#ffeaa7' },
      rechazada: { bg: '#fdecea', color: '#a71d2a', border: '#f5c6cb' }
    }
    return colors[estado] || colors.pendiente
  }

  // Componente de tarjeta reutilizable
  const MetricCard = ({ icon, title, value, subtitle, color, children, onClick }) => (
    <div className={`metric-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
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

  // Modal de perfil del usuario
  const ProfileModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3> Información del Perfil</h3>
          <button 
            onClick={() => setShowProfileModal(false)}
            className="close-btn"
          >
            ×
          </button>
        </div>
        <div className="profile-modal-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.nombre || 'Usuario'}</h2>
              <p className="profile-role">
                {isAdmin() ? 'Administrador' : isCoordinador() ? 'Coordinador' : 'Profesor'}
              </p>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h4> Información de Contacto</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user?.email || 'No disponible'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{user?.nombre || 'No disponible'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rol:</span>
                  <span className="detail-value">
                    {isAdmin() ? 'Administrador' : isCoordinador() ? 'Coordinador' : 'Profesor'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4> Estadísticas del Sistema</h4>
              <div className="stats-grid">
                <div className="stat-item-modal">
                  <span className="stat-label-modal">Planeaciones:</span>
                  <span className="stat-value-modal">{stats.totalPlaneaciones || 0}</span>
                </div>
                <div className="stat-item-modal">
                  <span className="stat-label-modal">Avances:</span>
                  <span className="stat-value-modal">{stats.totalAvances || 0}</span>
                </div>
                <div className="stat-item-modal">
                  <span className="stat-label-modal">Evidencias:</span>
                  <span className="stat-value-modal">{stats.totalEvidencias || 0}</span>
                </div>
                {isProfesor() && (
                  <>
                    <div className="stat-item-modal">
                      <span className="stat-label-modal">Pendientes:</span>
                      <span className="stat-value-modal" style={{color: '#ffc107'}}>
                        {stats.planeacionesPendientes || 0}
                      </span>
                    </div>
                    <div className="stat-item-modal">
                      <span className="stat-label-modal">Cumplidos:</span>
                      <span className="stat-value-modal" style={{color: '#28a745'}}>
                        {stats.avancesCumplidos || 0}
                      </span>
                    </div>
                    <div className="stat-item-modal">
                      <span className="stat-label-modal">Validadas:</span>
                      <span className="stat-value-modal" style={{color: '#28a745'}}>
                        {stats.evidenciasValidadas || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h4> Actividad Reciente</h4>
              <div className="activity-summary">
                <p>
                  {isProfesor() 
                    ? `Tienes ${stats.planeacionesPendientes || 0} planeaciones pendientes y ${stats.avancesCumplidos || 0} avances cumplidos.`
                    : 'Vista general del sistema institucional.'
                  }
                </p>
                <div className="last-login">
                  <span>Última actualización: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              onClick={() => setShowProfileModal(false)}
              className="btn-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
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
              icon=""
              title="Profesores Activos"
              value={reporte?.resumenGeneral?.totalProfesores || 0}
              subtitle="Total en el sistema"
              color="#3498db"
            />

            <MetricCard
              icon=""
              title="Planeaciones"
              value={reporte?.resumenGeneral?.totalPlaneaciones || 0}
              subtitle={`${stats.planeacionesPendientes || 0} pendientes`}
              color="#28a745"
            />

            <MetricCard
              icon=""
              title="Avances Registrados"
              value={reporte?.resumenGeneral?.totalAvances || 0}
              subtitle="Seguimiento académico"
              color="#e74c3c"
            />

            <MetricCard
              icon=""
              title="Evidencias"
              value={reporte?.resumenGeneral?.totalEvidencias || 0}
              subtitle="Documentación cargada"
              color="#9b59b6"
            />
          </div>

          {/* Sección de rendimiento */}
          <div className="performance-section">
            <h2> Rendimiento General</h2>
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
                icon=""
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
                icon=""
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
            <h2> Distribución por Periodos Académicos</h2>
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
              icon=""
              title="Mis Planeaciones"
              value={stats.totalPlaneaciones || 0}
              subtitle={`${stats.planeacionesPendientes || 0} pendientes`}
              color="#28a745"
            />

            <MetricCard
              icon=""
              title="Mis Avances"
              value={stats.totalAvances || 0}
              subtitle={`${stats.avancesCumplidos || 0} cumplidos`}
              color="#3498db"
            />

            <MetricCard
              icon=""
              title="Mis Evidencias"
              value={stats.totalEvidencias || 0}
              subtitle={`${stats.evidenciasValidadas || 0} validadas`}
              color="#9b59b6"
            />

            <MetricCard
              icon="👤"
              title="Mi Perfil"
              value={user?.nombre || 'Profesor'}
              subtitle="Ver información completa"
              color="#e74c3c"
              onClick={() => setShowProfileModal(true)}
            />
          </div>

          {/* Actividad reciente MEJORADA */}
          <div className="recent-activity-section">
            <div className="section-header">
              <h2> Mi Actividad Reciente</h2>
              <p>Últimas planeaciones y avances registrados en el sistema</p>
            </div>
            
            <div className="activity-grid">
              {/* Planeaciones Recientes */}
              <div className="activity-column">
                <div className="activity-header">
                  <div className="activity-icon"></div>
                  <div>
                    <h3>Últimas Planeaciones</h3>
                    <span className="activity-count">{stats.planeacionesRecientes?.length || 0} registros</span>
                  </div>
                </div>
                <div className="activity-cards">
                  {stats.planeacionesRecientes?.map((planeacion) => {
                    const estadoColor = getEstadoColor(planeacion.estado)
                    return (
                      <div key={planeacion._id} className="activity-card">
                        <div className="card-main">
                          <div className="card-title">
                            <h4>{planeacion.materia}</h4>
                            <span 
                              className="status-badge"
                              style={{
                                background: estadoColor.bg,
                                color: estadoColor.color,
                                borderColor: estadoColor.border
                              }}
                            >
                              {planeacion.estado}
                            </span>
                          </div>
                          <div className="card-details">
                            <div className="detail-item">
                              <span className="detail-label">Parcial:</span>
                              <span className="detail-value">{planeacion.parcial}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Fecha:</span>
                              <span className="detail-value">
                                {new Date(planeacion.fechaCreacion).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button className="btn-view">Ver Detalles</button>
                        </div>
                      </div>
                    )
                  })}
                  {(!stats.planeacionesRecientes || stats.planeacionesRecientes.length === 0) && (
                    <div className="empty-activity">
                      <div className="empty-icon"></div>
                      <p>No hay planeaciones recientes</p>
                      <small>Las planeaciones que crees aparecerán aquí</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Avances Recientes */}
              <div className="activity-column">
                <div className="activity-header">
                  <div className="activity-icon"></div>
                  <div>
                    <h3>Últimos Avances</h3>
                    <span className="activity-count">{stats.avancesRecientes?.length || 0} registros</span>
                  </div>
                </div>
                <div className="activity-cards">
                  {stats.avancesRecientes?.map((avance) => {
                    const cumplimientoColor = getCumplimientoColor(avance.cumplimiento)
                    return (
                      <div key={avance._id} className="activity-card">
                        <div className="card-main">
                          <div className="card-title">
                            <h4>{avance.materia}</h4>
                            <span 
                              className="status-badge"
                              style={{
                                background: cumplimientoColor.bg,
                                color: cumplimientoColor.color,
                                borderColor: cumplimientoColor.border
                              }}
                            >
                              {avance.cumplimiento}
                            </span>
                          </div>
                          <div className="card-details">
                            <div className="detail-item">
                              <span className="detail-label">Avance:</span>
                              <span className="detail-value highlight">{avance.porcentajeAvance}%</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Parcial:</span>
                              <span className="detail-value">{avance.parcial}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Temas:</span>
                              <span className="detail-value">
                                {avance.temasCubiertos.length}/{avance.temasPlaneados.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button className="btn-view">Ver Progreso</button>
                        </div>
                      </div>
                    )
                  })}
                  {(!stats.avancesRecientes || stats.avancesRecientes.length === 0) && (
                    <div className="empty-activity">
                      <div className="empty-icon"></div>
                      <p>No hay avances recientes</p>
                      <small>Los avances que registres aparecerán aquí</small>
                    </div>
                  )}
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
          <h2> {isProfesor() ? 'Mis Planeaciones' : 'Gestión de Planeaciones'}</h2>
          <p>
            {isProfesor() 
              ? 'Resumen y estado de mis planeaciones didácticas' 
              : 'Resumen y estado actual de las planeaciones didácticas'
            }
          </p>
        </div>

        <div className="metrics-grid">
          <MetricCard
            icon=""
            title="Total"
            value={planeacionesData.length}
            subtitle={isProfesor() ? "Mis planeaciones" : "Registradas en el sistema"}
            color="#3498db"
          />

          <MetricCard
            icon=""
            title="Aprobadas"
            value={planeacionesData.filter(p => p.estado === 'aprobado').length}
            subtitle="Planeaciones validadas"
            color="#28a745"
          />

          <MetricCard
            icon=""
            title="Pendientes"
            value={planeacionesData.filter(p => p.estado === 'pendiente').length}
            subtitle="En espera de revisión"
            color="#ffc107"
          />

          <MetricCard
            icon=""
            title="Rechazadas"
            value={planeacionesData.filter(p => p.estado === 'rechazado').length}
            subtitle="Requieren ajustes"
            color="#dc3545"
          />
        </div>

        <div className="recent-section">
          <h3> {isProfesor() ? 'Mis Planeaciones' : 'Planeaciones Recientes'}</h3>
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
          <h2> {isProfesor() ? 'Mis Avances' : 'Seguimiento de Avances'}</h2>
          <p>
            {isProfesor() 
              ? 'Monitoreo de mi progreso académico' 
              : 'Monitoreo del progreso académico por parcial'
            }
          </p>
        </div>

        <div className="metrics-grid">
          <MetricCard
            icon=""
            title="Total"
            value={avancesData.length}
            subtitle={isProfesor() ? "Mis registros" : "Registros de seguimiento"}
            color="#3498db"
          />

          <MetricCard
            icon=""
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
            icon=""
            title="No Cumplidos"
            value={avancesData.filter(a => a.cumplimiento === 'no cumplido').length}
            subtitle="Requieren atención"
            color="#dc3545"
          />
        </div>

        <div className="recent-section">
          <h3> {isProfesor() ? 'Mis Avances' : 'Avances Recientes'}</h3>
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
          <h1> Panel de Control {isProfesor() ? 'Docente' : 'Institucional'}</h1>
          <p>
            {isProfesor() 
              ? `Bienvenido/a ${user?.nombre || 'Profesor'} - Vista general de tu actividad académica`
              : 'Vista general del sistema académico y métricas clave'
            }
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={loadDashboardData}>
             Actualizar
          </button>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
           Vista General
        </button>
        <button 
          className={`tab-button ${activeTab === 'planeaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('planeaciones')}
        >
           {isProfesor() ? 'Mis Planeaciones' : 'Planeaciones'}
        </button>
        <button 
          className={`tab-button ${activeTab === 'avances' ? 'active' : ''}`}
          onClick={() => setActiveTab('avances')}
        >
           {isProfesor() ? 'Mis Avances' : 'Avances'}
        </button>
      </nav>

      {/* Contenido del dashboard según rol */}
      {renderDashboardByRole()}

      {/* Modal de perfil */}
      {showProfileModal && <ProfileModal />}
    </div>
  )
}

export default Dashboard