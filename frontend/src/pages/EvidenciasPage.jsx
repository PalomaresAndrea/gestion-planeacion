import React, { useState, useEffect } from 'react'
import { evidenciaService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/EvidenciasStyles.css'

const EvidenciasPage = () => {
  const [evidencias, setEvidencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showFormModal, setShowFormModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [formData, setFormData] = useState({
    nombreCurso: '',
    institucion: '',
    fechaInicio: '',
    fechaFin: '',
    horasAcreditadas: '',
    tipoCapacitacion: 'curso',
    archivo: '',
    observaciones: ''
  })
  const [subiendo, setSubiendo] = useState(false)

  const { user, isCoordinador, isAdmin, isProfesor } = useAuth()

  useEffect(() => {
    loadEvidencias()
  }, [filters])

  const loadEvidencias = async () => {
    try {
      const response = await evidenciaService.getAll(filters)
      setEvidencias(response.data)
    } catch (error) {
      console.error('Error cargando evidencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubiendo(true)

    try {
      // Validaciones
      if (!formData.nombreCurso) {
        throw new Error('El nombre del curso es requerido')
      }
      if (!formData.institucion) {
        throw new Error('La institución es requerida')
      }
      if (!formData.fechaInicio || !formData.fechaFin) {
        throw new Error('Las fechas son requeridas')
      }
      if (!formData.horasAcreditadas) {
        throw new Error('Las horas acreditadas son requeridas')
      }
      if (!formData.archivo) {
        throw new Error('El archivo o enlace es requerido')
      }

      // Para profesores, no enviar el campo profesor (se asigna automáticamente en el backend)
      const dataToSend = isProfesor() ? {
        nombreCurso: formData.nombreCurso,
        institucion: formData.institucion,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        horasAcreditadas: parseInt(formData.horasAcreditadas),
        tipoCapacitacion: formData.tipoCapacitacion,
        archivo: formData.archivo,
        observaciones: formData.observaciones
      } : {
        profesor: formData.profesor,
        nombreCurso: formData.nombreCurso,
        institucion: formData.institucion,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        horasAcreditadas: parseInt(formData.horasAcreditadas),
        tipoCapacitacion: formData.tipoCapacitacion,
        archivo: formData.archivo,
        observaciones: formData.observaciones
      }

      await evidenciaService.create(dataToSend)
      setShowFormModal(false)
      resetForm()
      loadEvidencias()
      setModalMessage('✅ Evidencia registrada exitosamente y enviada para validación')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error al registrar evidencia:', error)
      setModalMessage('❌ Error al registrar evidencia: ' + (error.response?.data?.message || error.message))
      setShowErrorModal(true)
    } finally {
      setSubiendo(false)
    }
  }

  const resetForm = () => {
    setFormData({
      profesor: '',
      nombreCurso: '',
      institucion: '',
      fechaInicio: '',
      fechaFin: '',
      horasAcreditadas: '',
      tipoCapacitacion: 'curso',
      archivo: '',
      observaciones: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleValidar = async (id, estado) => {
    try {
      // Verificar permisos para validar
      if (!isCoordinador() && !isAdmin()) {
        alert('No tienes permisos para validar evidencias')
        return
      }

      const observaciones = estado === 'rechazada' 
        ? prompt('Ingresa las observaciones de rechazo:')
        : `Evidencia ${estado}`

      if (estado === 'rechazada' && !observaciones) {
        return // El usuario canceló
      }

      await evidenciaService.validar(id, {
        estado,
        coordinadorValidador: user?.nombre || 'Coordinador Académico',
        observaciones: observaciones || `Evidencia ${estado}`
      })
      loadEvidencias()
      setModalMessage(`✅ Evidencia ${estado} exitosamente`)
      setShowSuccessModal(true)
    } catch (error) {
      setModalMessage('❌ Error al validar evidencia: ' + (error.response?.data?.message || error.message))
      setShowErrorModal(true)
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: { bg: '#fff8e1', color: '#a68b00', border: '#ffeaa7' },
      validada: { bg: '#e8f8ec', color: '#1e7e34', border: '#c8e6c9' },
      rechazada: { bg: '#fdecea', color: '#a71d2a', border: '#f5c6cb' }
    }
    return colors[estado] || colors.pendiente
  }

  const getTipoIcon = (tipo) => {
    const icons = {
      curso: '📚',
      taller: '🔧', 
      diplomado: '🎓',
      seminario: '💬',
      congreso: '🏛️',
      otro: '📄'
    }
    return icons[tipo] || icons.otro
  }

  // Verificar si puede validar evidencias
  const puedeValidar = () => {
    return isCoordinador() || isAdmin()
  }

  // Verificar si puede registrar evidencias para otros
  const puedeRegistrarParaOtros = () => {
    return isCoordinador() || isAdmin()
  }

  // Estadísticas para coordinadores/admin
  const totalHoras = evidencias.reduce((acc, curr) => acc + curr.horasAcreditadas, 0)
  const evidenciasValidadas = evidencias.filter(e => e.estado === 'validada').length
  const evidenciasPendientes = evidencias.filter(e => e.estado === 'pendiente').length

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Cargando evidencias...</p>
      </div>
    )
  }

  return (
    <div className="evidencias-container">
      {/* Header */}
      <header className="evidencias-header">
        <div className="header-content">
          <div>
            <h1> {isProfesor() ? 'Mis Evidencias' : 'Evidencias de Capacitación'}</h1>
            <p>
              {isProfesor() 
                ? 'Gestión de tus cursos, talleres y formación docente' 
                : 'Gestión de cursos, talleres y formación docente'
              }
            </p>
          </div>
          <div className="header-badge">
            {isAdmin() ? 'Administrador' : isCoordinador() ? 'Coordinador' : 'Profesor'}
          </div>
        </div>
      </header>

      {/* Estadísticas rápidas para coordinadores/admin */}
      {(isCoordinador() || isAdmin()) && (
        <div className="estadisticas-rapidas">
          <div className="estadistica-card">
            <span className="estadistica-valor">{evidencias.length}</span>
            <span className="estadistica-label">Total</span>
          </div>
          <div className="estadistica-card">
            <span className="estadistica-valor" style={{color: '#28a745'}}>
              {evidenciasValidadas}
            </span>
            <span className="estadistica-label">Validadas</span>
          </div>
          <div className="estadistica-card">
            <span className="estadistica-valor" style={{color: '#ffc107'}}>
              {evidenciasPendientes}
            </span>
            <span className="estadistica-label">Pendientes</span>
          </div>
          <div className="estadistica-card">
            <span className="estadistica-valor" style={{color: '#667eea'}}>
              {totalHoras}h
            </span>
            <span className="estadistica-label">Horas Totales</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-card">
        <h3> Filtros y Búsqueda</h3>
        <div className="filters-grid">
          <select 
            value={filters.estado || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="validada">Validada</option>
            <option value="rechazada">Rechazada</option>
          </select>

          <select 
            value={filters.tipo || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
          >
            <option value="">Todos los tipos</option>
            <option value="curso">Curso</option>
            <option value="taller">Taller</option>
            <option value="diplomado">Diplomado</option>
            <option value="seminario">Seminario</option>
            <option value="congreso">Congreso</option>
            <option value="otro">Otro</option>
          </select>

          {/* Filtro por profesor solo para coordinadores/admin */}
          {(isCoordinador() || isAdmin()) && (
            <input
              type="text"
              placeholder="Buscar por profesor..."
              value={filters.profesor || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, profesor: e.target.value }))}
            />
          )}

          <input
            type="text"
            placeholder="Buscar por institución..."
            value={filters.institucion || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, institucion: e.target.value }))}
          />

          <button
            onClick={() => setFilters({})}
            className="btn-secondary"
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Botón de nueva evidencia */}
      <div className="actions-bar">
        <button
          onClick={() => setShowFormModal(true)}
          className="btn-primary"
        >
          + Nueva Evidencia
        </button>
        <span className="results-count">
          {evidencias.length} {isProfesor() ? 'mis evidencias' : 'resultados'}
        </span>
      </div>

      {/* Modal de Formulario */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3> Registrar Nueva Evidencia</h3>
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
            <form onSubmit={handleSubmit} className="evidencia-form-modal">
              {/* Campo profesor solo para coordinadores/admin */}
              {puedeRegistrarParaOtros() && (
                <div className="form-row">
                  <input
                    type="text"
                    placeholder=" Profesor *"
                    name="profesor"
                    value={formData.profesor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <input
                  type="text"
                  placeholder=" Nombre del Curso/Taller *"
                  name="nombreCurso"
                  value={formData.nombreCurso}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  placeholder=" Institución *"
                  name="institucion"
                  value={formData.institucion}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <select
                  name="tipoCapacitacion"
                  value={formData.tipoCapacitacion}
                  onChange={handleInputChange}
                  required
                >
                  <option value="curso"> Curso</option>
                  <option value="taller"> Taller</option>
                  <option value="diplomado"> Diplomado</option>
                  <option value="seminario"> Seminario</option>
                  <option value="congreso"> Congreso</option>
                  <option value="otro"> Otro</option>
                </select>
                <input
                  type="number"
                  placeholder="⏱️ Horas Acreditadas *"
                  name="horasAcreditadas"
                  value={formData.horasAcreditadas}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-row">
                <input
                  type="date"
                  placeholder=" Fecha de Inicio *"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="date"
                  placeholder=" Fecha de Fin *"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="📎 Archivo o Enlace * (Nombre del archivo o URL)"
                  name="archivo"
                  value={formData.archivo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <textarea
                placeholder="💭 Observaciones adicionales (opcional)"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="3"
              />

              <div className="form-note">
                <strong> Nota:</strong> 
                {isProfesor() 
                  ? " El sistema asignará automáticamente tu nombre como profesor." 
                  : " Asegúrate de que toda la información sea correcta antes de registrar."
                }
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
                    <>⏳ Registrando...</>
                  ) : (
                    <> Registrar Evidencia</>
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

      {/* Lista de evidencias */}
      <div className="evidencias-list">
        {evidencias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No hay evidencias {isProfesor() ? 'tuyas' : ''} registradas</h3>
            <p>
              {isProfesor() 
                ? 'Cuando registres evidencias de capacitación, aparecerán aquí.' 
                : 'No se encontraron evidencias con los filtros aplicados.'
              }
            </p>
            <button
              onClick={() => setShowFormModal(true)}
              className="btn-primary"
            >
              Registrar Primera Evidencia
            </button>
          </div>
        ) : (
          <div className="evidencias-grid">
            {evidencias.map((evidencia) => {
              const estadoColor = getEstadoColor(evidencia.estado)
              const tipoIcon = getTipoIcon(evidencia.tipoCapacitacion)
              
              return (
                <div key={evidencia._id} className="evidencia-card">
                  <div className="card-header">
                    <div className="card-title">
                      <h3>{evidencia.nombreCurso}</h3>
                      <div className="card-meta">
                        <span className="profesor">{evidencia.profesor}</span>
                        <span className="institucion">{evidencia.institucion}</span>
                      </div>
                    </div>
                    <div className="card-badges">
                      <span className="tipo-icon" title={evidencia.tipoCapacitacion}>
                        {tipoIcon}
                      </span>
                      <span 
                        className="estado"
                        style={{
                          background: estadoColor.bg,
                          color: estadoColor.color,
                          borderColor: estadoColor.border
                        }}
                      >
                        {evidencia.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="details-grid">
                      <div className="detail-item">
                        <strong> Horas:</strong> {evidencia.horasAcreditadas}h
                      </div>
                      <div className="detail-item">
                        <strong> Tipo:</strong> {evidencia.tipoCapacitacion}
                      </div>
                      <div className="detail-item">
                        <strong> Fecha:</strong> {new Date(evidencia.fechaInicio).toLocaleDateString()} - {new Date(evidencia.fechaFin).toLocaleDateString()}
                      </div>
                      <div className="detail-item">
                        <strong> Archivo:</strong> 
                        <span className="archivo">{evidencia.archivo}</span>
                      </div>
                    </div>

                    {evidencia.observaciones && (
                      <div className="observaciones">
                        <strong> Observaciones:</strong> {evidencia.observaciones}
                      </div>
                    )}

                    {/* Acciones de validación solo para coordinadores/admin */}
                    {puedeValidar() && evidencia.estado === 'pendiente' && (
                      <div className="acciones">
                        <button
                          onClick={() => handleValidar(evidencia._id, 'validada')}
                          className="btn btn-success"
                        >
                           Validar
                        </button>
                        <button
                          onClick={() => handleValidar(evidencia._id, 'rechazada')}
                          className="btn btn-danger"
                        >
                           Rechazar
                        </button>
                      </div>
                    )}

                    {evidencia.coordinadorValidador && (
                      <div className="validacion-info">
                        <strong>👤 Validado por:</strong> {evidencia.coordinadorValidador} 
                        {evidencia.fechaValidacion && (
                          <> el {new Date(evidencia.fechaValidacion).toLocaleDateString()}</>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EvidenciasPage