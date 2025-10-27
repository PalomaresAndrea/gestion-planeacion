import React, { useState, useEffect } from 'react'
import { planeacionService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/PlaneacionesStyles.css'

const PlaneacionesPage = () => {
  const [planeaciones, setPlaneaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificacionEstado, setNotificacionEstado] = useState({})
  const [filtros, setFiltros] = useState({
    materia: '',
    parcial: '',
    estado: ''
  })

  const { user, isCoordinador, isAdmin, isProfesor } = useAuth()

  useEffect(() => {
    loadPlaneaciones()
  }, [])

  const loadPlaneaciones = async () => {
    try {
      // El backend ya filtra automáticamente por usuario si es profesor
      const response = await planeacionService.getAll(filtros)
      setPlaneaciones(response.data)
    } catch (error) {
      console.error('Error cargando planeaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const manejarRevision = async (id, estado, observaciones = '') => {
    try {
      // Verificar permisos para revisar
      if (!isCoordinador() && !isAdmin()) {
        alert('No tienes permisos para revisar planeaciones')
        return
      }

      const datosRevision = {
        estado,
        observaciones,
        coordinadorRevisor: user?.nombre || 'Coordinador'
      }

      const response = await planeacionService.revisar(id, datosRevision)

      setPlaneaciones(prev =>
        prev.map(p => (p._id === id ? response.data : p))
      )

      setNotificacionEstado(prev => ({
        ...prev,
        [id]: {
          enviada: true,
          estado,
          mensaje: `Notificación enviada al profesor (${estado})`
        }
      }))

      setTimeout(() => {
        setNotificacionEstado(prev => {
          const nuevo = { ...prev }
          delete nuevo[id]
          return nuevo
        })
      }, 5000)
    } catch (error) {
      console.error('Error en revisión:', error)
      alert('Error al procesar la revisión: ' + (error.response?.data?.message || error.message))
    }
  }

  const aplicarFiltros = () => {
    setLoading(true)
    loadPlaneaciones()
  }

  const limpiarFiltros = () => {
    setFiltros({
      materia: '',
      parcial: '',
      estado: ''
    })
    setLoading(true)
    // Recargar sin filtros
    setTimeout(() => loadPlaneaciones(), 100)
  }

  // Verificar si el usuario puede editar esta planeación
  const puedeEditar = (planeacion) => {
    if (isAdmin()) return true
    if (isCoordinador()) return true
    if (isProfesor() && planeacion.usuario_id === user?._id) return true
    return false
  }

  // Verificar si el usuario puede revisar planeaciones
  const puedeRevisar = () => {
    return isCoordinador() || isAdmin()
  }

  const getEstadoColor = (estado) => {
    const colores = {
      aprobado: '#28a745',
      pendiente: '#ffc107',
      rechazado: '#dc3545',
      ajustes_solicitados: '#17a2b8'
    }
    return colores[estado] || '#6c757d'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Cargando planeaciones...</p>
      </div>
    )
  }

  return (
    <div className="planeaciones-container">
      <header className="planeaciones-header">
        <div className="header-content">
          <div>
            <h1>📋 {isProfesor() ? 'Mis Planeaciones' : 'Gestión de Planeaciones'}</h1>
            <p>
              {isProfesor() 
                ? 'Administra y visualiza tus planeaciones didácticas' 
                : 'Administra, revisa y aprueba las planeaciones didácticas'
              }
            </p>
          </div>
          <div className="header-badge">
            {isAdmin() ? 'Administrador' : isCoordinador() ? 'Coordinador' : 'Profesor'}
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-grid">
          <input
            type="text"
            placeholder="Filtrar por materia"
            value={filtros.materia}
            onChange={(e) => setFiltros(prev => ({ ...prev, materia: e.target.value }))}
            className="filtro-input"
          />
          
          <select
            value={filtros.parcial}
            onChange={(e) => setFiltros(prev => ({ ...prev, parcial: e.target.value }))}
            className="filtro-select"
          >
            <option value="">Todos los parciales</option>
            <option value="1">Parcial 1</option>
            <option value="2">Parcial 2</option>
            <option value="3">Parcial 3</option>
          </select>

          <select
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            className="filtro-select"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="ajustes_solicitados">Ajustes Solicitados</option>
          </select>

          <div className="filtros-acciones">
            <button onClick={aplicarFiltros} className="btn btn-primary">
              🔍 Aplicar Filtros
            </button>
            <button onClick={limpiarFiltros} className="btn btn-secondary">
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {!isProfesor() && (
        <div className="estadisticas-rapidas">
          <div className="estadistica-card">
            <span className="estadistica-valor">{planeaciones.length}</span>
            <span className="estadistica-label">Total</span>
          </div>
          <div className="estadistica-card">
            <span className="estadistica-valor" style={{color: '#ffc107'}}>
              {planeaciones.filter(p => p.estado === 'pendiente').length}
            </span>
            <span className="estadistica-label">Pendientes</span>
          </div>
          <div className="estadistica-card">
            <span className="estadistica-valor" style={{color: '#28a745'}}>
              {planeaciones.filter(p => p.estado === 'aprobado').length}
            </span>
            <span className="estadistica-label">Aprobadas</span>
          </div>
          <div className="estadistica-card">
            <span className="estadistica-valor" style={{color: '#dc3545'}}>
              {planeaciones.filter(p => p.estado === 'rechazado').length}
            </span>
            <span className="estadistica-label">Rechazadas</span>
          </div>
        </div>
      )}

      {/* Lista de planeaciones */}
      <div className="planeaciones-list">
        {planeaciones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay planeaciones {isProfesor() ? 'tuyas' : ''} registradas</h3>
            <p>
              {isProfesor() 
                ? 'Cuando crees planeaciones, aparecerán aquí.' 
                : 'No se encontraron planeaciones con los filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          planeaciones.map((planeacion) => (
            <div className="planeacion-card" key={planeacion._id}>
              {notificacionEstado[planeacion._id] && (
                <div className={`notif-badge ${notificacionEstado[planeacion._id].estado}`}>
                  📩 {notificacionEstado[planeacion._id].mensaje}
                </div>
              )}

              <div className="card-header">
                <h3>{planeacion.materia} — Parcial {planeacion.parcial}</h3>
                <span 
                  className="estado-badge"
                  style={{ backgroundColor: getEstadoColor(planeacion.estado) }}
                >
                  {planeacion.estado.toUpperCase()}
                </span>
              </div>

              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Profesor:</strong>
                    <span>{planeacion.profesor}</span>
                  </div>
                  <div className="info-item">
                    <strong>Ciclo Escolar:</strong>
                    <span>{planeacion.cicloEscolar}</span>
                  </div>
                  <div className="info-item">
                    <strong>Fecha de subida:</strong>
                    <span>{new Date(planeacion.fechaSubida).toLocaleDateString()}</span>
                  </div>
                  {planeacion.coordinadorRevisor && (
                    <div className="info-item">
                      <strong>Revisor:</strong>
                      <span>{planeacion.coordinadorRevisor}</span>
                    </div>
                  )}
                  {planeacion.observaciones && (
                    <div className="info-item full-width">
                      <strong>Observaciones:</strong>
                      <span>{planeacion.observaciones}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones según permisos */}
              <div className="acciones">
                {puedeEditar(planeacion) && (
                  <button className="btn btn-outline">
                    ✏️ Editar
                  </button>
                )}
                
                {puedeRevisar() && planeacion.estado === 'pendiente' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() =>
                        manejarRevision(
                          planeacion._id,
                          'aprobado',
                          'Planeación aprobada correctamente'
                        )
                      }
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        const observaciones = prompt('Ingresa las observaciones para ajustes:')
                        if (observaciones) {
                          manejarRevision(planeacion._id, 'ajustes_solicitados', observaciones)
                        }
                      }}
                    >
                      🔄 Solicitar Ajustes
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        const observaciones = prompt('Ingresa las observaciones de rechazo:')
                        if (observaciones) {
                          manejarRevision(planeacion._id, 'rechazado', observaciones)
                        }
                      }}
                    >
                      ❌ Rechazar
                    </button>
                  </>
                )}

                {isProfesor() && planeacion.estado === 'ajustes_solicitados' && (
                  <button className="btn btn-primary">
                     Reenviar para Revisión
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PlaneacionesPage