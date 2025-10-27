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
  const [showFormModal, setShowFormModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [formData, setFormData] = useState({
    materia: '',
    parcial: 1,
    cicloEscolar: '',
    archivo: null
  })
  const [archivoNombre, setArchivoNombre] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  const { user, isCoordinador, isAdmin, isProfesor } = useAuth()

  useEffect(() => {
    loadPlaneaciones()
  }, [])

  const loadPlaneaciones = async () => {
    try {
      const response = await planeacionService.getAll(filtros)
      setPlaneaciones(response.data)
    } catch (error) {
      console.error('Error cargando planeaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generar ciclo escolar actual por defecto
  const getCicloActual = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubiendo(true)

    try {
      // Validaciones
      if (!formData.materia) {
        throw new Error('La materia es requerida')
      }
      if (!formData.archivo) {
        throw new Error('Debe seleccionar un archivo PDF')
      }

      // Crear FormData para enviar archivo
      const submitData = new FormData()
      
      // Para coordinadores/admin, permitir especificar profesor
      if (!isProfesor()) {
        submitData.append('profesor', formData.profesor || '')
      }
      
      submitData.append('materia', formData.materia)
      submitData.append('parcial', formData.parcial.toString())
      submitData.append('cicloEscolar', formData.cicloEscolar || getCicloActual())
      submitData.append('archivo', formData.archivo)

      console.log('Enviando planeación...', {
        materia: formData.materia,
        parcial: formData.parcial,
        cicloEscolar: formData.cicloEscolar || getCicloActual(),
        archivo: formData.archivo.name
      })

      await planeacionService.create(submitData)
      
      setShowFormModal(false)
      resetForm()
      loadPlaneaciones()
      setModalMessage('✅ Planeación creada exitosamente y enviada para revisión')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error al crear planeación:', error)
      setModalMessage('❌ Error al crear planeación: ' + (error.response?.data?.message || error.message))
      setShowErrorModal(true)
    } finally {
      setSubiendo(false)
    }
  }

  const resetForm = () => {
    setFormData({
      materia: '',
      parcial: 1,
      cicloEscolar: '',
      archivo: null
    })
    setArchivoNombre('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        setModalMessage('❌ Solo se permiten archivos PDF')
        setShowErrorModal(true)
        return
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setModalMessage('❌ El archivo no debe exceder 10MB')
        setShowErrorModal(true)
        return
      }

      setFormData(prev => ({ ...prev, archivo: file }))
      setArchivoNombre(file.name)
    }
  }

  const manejarRevision = async (id, estado, observaciones = '') => {
    try {
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
    setTimeout(() => loadPlaneaciones(), 100)
  }

  const descargarArchivo = async (planeacion) => {
    try {
      const response = await planeacionService.descargarArchivo(planeacion._id)
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', planeacion.archivoOriginal || 'planeacion.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando archivo:', error)
      alert('Error al descargar el archivo')
    }
  }

  const verArchivo = async (planeacion) => {
    try {
      const response = await planeacionService.verArchivo(planeacion._id)
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Error viendo archivo:', error)
      alert('Error al abrir el archivo')
    }
  }

  const puedeEditar = (planeacion) => {
    if (isAdmin()) return true
    if (isCoordinador()) return true
    if (isProfesor() && planeacion.usuario_id === user?._id) return true
    return false
  }

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

  const materiasComunes = [
    'Matemáticas I',
    'Matemáticas II',
    'Matemáticas III',
    'Cálculo Diferencial',
    'Cálculo Integral',
    'Álgebra Lineal',
    'Estadística',
    'Física I',
    'Física II',
    'Química General',
    'Programación',
    'Inglés',
    'Español',
    'Historia',
    'Geografía',
    'Biología',
    'Filosofía'
  ]

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
            <h1> {isProfesor() ? 'Mis Planeaciones' : 'Gestión de Planeaciones'}</h1>
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

      {/* Botón para nueva planeación */}
      <div className="actions-bar">
        <button
          onClick={() => setShowFormModal(true)}
          className="btn-primary"
        >
          + Nueva Planeación
        </button>
        <span className="results-count">
          {planeaciones.length} {isProfesor() ? 'mis planeaciones' : 'planeaciones'}
        </span>
      </div>

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
               Aplicar Filtros
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

      {/* Modal de Formulario */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3> Nueva Planeación Didáctica</h3>
              <button 
                onClick={() => {
                  setShowFormModal(false)
                  resetForm()
                }}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="planeacion-form-modal">
              {/* Campo profesor solo para coordinadores/admin */}
              {!isProfesor() && (
                <div className="form-row">
                  <input
                    type="text"
                    placeholder=" Profesor *"
                    name="profesor"
                    value={formData.profesor || ''}
                    onChange={handleInputChange}
                    required={!isProfesor()}
                  />
                </div>
              )}

              <div className="form-group">
                <label> Materia *</label>
                <select
                  name="materia"
                  value={formData.materia}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona una materia</option>
                  {materiasComunes.map((materia) => (
                    <option key={materia} value={materia}>
                      {materia}
                    </option>
                  ))}
                  <option value="otra">Otra materia...</option>
                </select>
                {formData.materia === 'otra' && (
                  <input
                    type="text"
                    placeholder="Especifica la materia"
                    onChange={(e) => setFormData(prev => ({ ...prev, materia: e.target.value }))}
                    className="materia-custom-input"
                  />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label> Parcial *</label>
                  <select
                    name="parcial"
                    value={formData.parcial}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Parcial 1</option>
                    <option value="2">Parcial 2</option>
                    <option value="3">Parcial 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label> Ciclo Escolar *</label>
                  <input
                    type="text"
                    name="cicloEscolar"
                    value={formData.cicloEscolar || getCicloActual()}
                    onChange={handleInputChange}
                    placeholder="Ej: 2024-2025"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label> Archivo PDF *</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="archivo"
                    name="archivo"
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="file-input"
                    required
                  />
                  <label htmlFor="archivo" className="file-label">
                    <div className="file-icon">📄</div>
                    <div className="file-text">
                      <strong>Seleccionar archivo PDF</strong>
                      <span>Haz clic o arrastra un archivo aquí</span>
                      <small>Máximo 10MB - Solo PDF</small>
                    </div>
                  </label>
                  {archivoNombre && (
                    <div className="file-selected">
                      <span> Archivo seleccionado:</span>
                      <strong>{archivoNombre}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-note">
                <strong> Nota:</strong> La planeación será enviada para revisión y aparecerá con estado "Pendiente". 
                {isProfesor() && ' El coordinador revisará tu planeación y te notificará el resultado.'}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                  disabled={subiendo}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={subiendo}
                >
                  {subiendo ? (
                    <>⏳ Subiendo...</>
                  ) : (
                    <> Subir Planeación</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modales de éxito y error */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-container success-modal">
            <div className="modal-icon">✅</div>
            <h3>¡Éxito!</h3>
            <p>{modalMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn-primary"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-container error-modal">
            <div className="modal-icon">❌</div>
            <h3>Error</h3>
            <p>{modalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="btn-primary"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Lista de planeaciones */}
      <div className="planeaciones-list">
        {planeaciones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No hay planeaciones {isProfesor() ? 'tuyas' : ''} registradas</h3>
            <p>
              {isProfesor() 
                ? 'Cuando crees planeaciones, aparecerán aquí.' 
                : 'No se encontraron planeaciones con los filtros aplicados.'
              }
            </p>
            <button
              onClick={() => setShowFormModal(true)}
              className="btn-primary"
            >
              Crear Primera Planeación
            </button>
          </div>
        ) : (
          planeaciones.map((planeacion) => (
            <div className="planeacion-card" key={planeacion._id}>
              {notificacionEstado[planeacion._id] && (
                <div className={`notif-badge ${notificacionEstado[planeacion._id].estado}`}>
                   {notificacionEstado[planeacion._id].mensaje}
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
                  <div className="info-item">
                    <strong>Archivo:</strong>
                    <span className="archivo-info">
                      {planeacion.archivoOriginal}
                      <div className="archivo-acciones">
                        <button 
                          onClick={() => verArchivo(planeacion)}
                          className="btn-archivo"
                          title="Ver archivo"
                        >
                           Ver
                        </button>
                        <button 
                          onClick={() => descargarArchivo(planeacion)}
                          className="btn-archivo"
                          title="Descargar archivo"
                        >
                           Descargar
                        </button>
                      </div>
                    </span>
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
                {puedeEditar(planeacion) && planeacion.estado === 'ajustes_solicitados' && (
                  <button className="btn btn-primary">
                     Corregir y Reenviar
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
                       Aprobar
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
                       Solicitar Ajustes
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
                       Rechazar
                    </button>
                  </>
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