import React, { useState, useEffect } from 'react'
import { planeacionService } from '../services/api'
import '../styles/PlaneacionesStyles.css'

const PlaneacionesPage = () => {
  const [planeaciones, setPlaneaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificacionEstado, setNotificacionEstado] = useState({})

  useEffect(() => {
    loadPlaneaciones()
  }, [])

  const loadPlaneaciones = async () => {
    try {
      const response = await planeacionService.getAll()
      setPlaneaciones(response.data)
    } catch (error) {
      console.error('Error cargando planeaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const manejarRevision = async (id, estado, observaciones = '') => {
    try {
      const datosRevision = {
        estado,
        observaciones,
        coordinadorRevisor: 'Coordinador Actual'
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
      alert('Error al procesar la revisión: ' + error.message)
    }
  }

  if (loading) return <div className="loading">Cargando planeaciones...</div>

  return (
    <div className="planeaciones-container">
      <header className="planeaciones-header">
        <h1> Gestión de Planeaciones</h1>
        <p>Administra, revisa y aprueba las planeaciones didácticas</p>
      </header>

      <div className="planeaciones-list">
        {planeaciones.length === 0 ? (
          <p className="empty">No hay planeaciones registradas</p>
        ) : (
          planeaciones.map((planeacion) => (
            <div className="planeacion-card" key={planeacion._id}>
              {notificacionEstado[planeacion._id] && (
                <div className="notif-badge">📩 Notificación enviada</div>
              )}

              <div className="card-content">
                <h3>{planeacion.materia} — Parcial {planeacion.parcial}</h3>
                <p><strong>Profesor:</strong> {planeacion.profesor}</p>
                
                <p className={`estado ${planeacion.estado}`}>
                  Estado: {planeacion.estado.toUpperCase()}
                </p>
              </div>

              {planeacion.estado === 'pendiente' && (
                <div className="acciones">
                  <button 
                    className="btn aprobar"
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
                    className="btn rechazar"
                    onClick={() => {
                      const observaciones = prompt('Ingresa las observaciones:')
                      if (observaciones) {
                        manejarRevision(planeacion._id, 'rechazado', observaciones)
                      }
                    }}
                  >
                    ❌ Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PlaneacionesPage