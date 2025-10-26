import React, { useState, useEffect } from 'react'
import { avanceService, notificacionService } from '../services/api'
import '../styles/AvancesStyles.css'

const AvancesPage = () => {
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showFormModal, setShowFormModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showRecordatorioModal, setShowRecordatorioModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [formData, setFormData] = useState({
    profesor: '',
    materia: '',
    parcial: 1,
    temasPlaneados: [''],
    temasCubiertos: [''],
    actividadesRealizadas: [''],
    dificultades: '',
    observaciones: ''
  })
  const [recordatorioEnviado, setRecordatorioEnviado] = useState(false)
  const [enviandoRecordatorios, setEnviandoRecordatorios] = useState(false)

  useEffect(() => {
    loadAvances()
  }, [filters])

  const loadAvances = async () => {
    try {
      const response = await avanceService.getAll(filters)
      setAvances(response.data)
    } catch (error) {
      console.error('Error cargando avances:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        profesor: formData.profesor,
        materia: formData.materia,
        parcial: formData.parcial,
        temasPlaneados: formData.temasPlaneados.filter(tema => tema.trim() !== ''),
        temasCubiertos: formData.temasCubiertos.filter(tema => tema.trim() !== ''),
        actividadesRealizadas: formData.actividadesRealizadas.filter(act => act.trim() !== ''),
        dificultades: formData.dificultades,
        observaciones: formData.observaciones
      }
      
      console.log('Enviando datos al backend:', dataToSend)
      
      await avanceService.create(dataToSend)
      setShowFormModal(false)
      resetForm()
      loadAvances()
      setModalMessage('Avance registrado exitosamente')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error completo:', error)
      setModalMessage('Error al registrar avance: ' + (error.response?.data?.message || error.message))
      setShowErrorModal(true)
    }
  }

  const enviarRecordatorios = async () => {
    try {
      setEnviandoRecordatorios(true)
      const response = await notificacionService.enviarRecordatorios()
      setModalMessage(`✅ ${response.data.message}`)
      setShowRecordatorioModal(true)
      setRecordatorioEnviado(true)
      
      setTimeout(() => {
        setRecordatorioEnviado(false)
        setEnviandoRecordatorios(false)
      }, 5000)
    } catch (error) {
      setModalMessage('❌ Error enviando recordatorios: ' + error.message)
      setShowErrorModal(true)
      setEnviandoRecordatorios(false)
    }
  }

  const addTema = (campo) => {
    setFormData(prev => ({
      ...prev,
      [campo]: [...prev[campo], '']
    }))
  }

  const removeTema = (campo, index) => {
    setFormData(prev => ({
      ...prev,
      [campo]: prev[campo].filter((_, i) => i !== index)
    }))
  }

  const updateTema = (campo, index, value) => {
    setFormData(prev => ({
      ...prev,
      [campo]: prev[campo].map((item, i) => i === index ? value : item)
    }))
  }

  const resetForm = () => {
    setFormData({
      profesor: '', materia: '', parcial: 1,
      temasPlaneados: [''], temasCubiertos: [''],
      actividadesRealizadas: [''], dificultades: '', observaciones: ''
    })
  }

  const getCumplimientoColor = (cumplimiento) => {
    const colors = {
      cumplido: { bg: '#e8f8ec', color: '#1e7e34' },
      parcial: { bg: '#fff8e1', color: '#a68b00' },
      no_cumplido: { bg: '#fdecea', color: '#a71d2a' }
    }
    return colors[cumplimiento] || colors.parcial
  }

  const avancesPendientes = avances.filter(a => 
    a.cumplimiento === 'parcial' || a.cumplimiento === 'no cumplido'
  ).length

  const profesoresConPendientes = [...new Set(
    avances
      .filter(a => a.cumplimiento === 'parcial' || a.cumplimiento === 'no cumplido')
      .map(a => a.profesor)
  )]

  if (loading) return <div className="loading">Cargando avances...</div>

  return (
    <div className="avances-container">
      <header className="avances-header">
        <div className="header-content">
          <h1> Control de Avances</h1>
          <p>Seguimiento del avance por parcial</p>
        </div>
        
        <div className="header-actions">
          {avancesPendientes > 0 && (
            <button
              onClick={enviarRecordatorios}
              disabled={recordatorioEnviado || enviandoRecordatorios}
              className={`btn-recordatorio ${
                recordatorioEnviado ? 'enviado' : enviandoRecordatorios ? 'enviando' : ''
              }`}
            >
              {enviandoRecordatorios ? (
                <>⏳ Enviando...</>
              ) : recordatorioEnviado ? (
                <>✅ Enviado</>
              ) : (
                <>
                  ⏰ Recordatorios
                  <span className="badge">{avancesPendientes}</span>
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowFormModal(true)}
            className="btn-primary"
          >
            + Registrar Avance
          </button>
        </div>
      </header>

      {recordatorioEnviado && (
        <div className="alert-success">
          <span>✅</span>
          <div>
            <strong>Recordatorios enviados exitosamente</strong>
            <div>Se notificó a {profesoresConPendientes.length} profesor(es) con avances pendientes</div>
          </div>
        </div>
      )}

      {avancesPendientes > 0 && !recordatorioEnviado && (
        <div className="alert-warning">
          <span>⏰</span>
          <div>
            <strong>{avancesPendientes} avance(s) pendiente(s)</strong>
            <div>{profesoresConPendientes.length} profesor(es) requieren seguimiento</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-card">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <select 
            value={filters.cumplimiento || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, cumplimiento: e.target.value }))}
          >
            <option value="">Todos los estados</option>
            <option value="cumplido">Cumplido</option>
            <option value="parcial">Parcial</option>
            <option value="no cumplido">No Cumplido</option>
          </select>

          <select 
            value={filters.parcial || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, parcial: e.target.value }))}
          >
            <option value="">Todos los parciales</option>
            <option value="1">Parcial 1</option>
            <option value="2">Parcial 2</option>
            <option value="3">Parcial 3</option>
          </select>

          <input
            type="text"
            placeholder="Filtrar por profesor..."
            value={filters.profesor || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, profesor: e.target.value }))}
          />

          <button
            onClick={() => setFilters({})}
            className="btn-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Modal de Formulario */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Registrar Nuevo Avance</h3>
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
            <form onSubmit={handleSubmit} className="avance-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Profesor"
                  value={formData.profesor}
                  onChange={(e) => setFormData(prev => ({ ...prev, profesor: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Materia"
                  value={formData.materia}
                  onChange={(e) => setFormData(prev => ({ ...prev, materia: e.target.value }))}
                  required
                />
              </div>

              <select
                value={formData.parcial}
                onChange={(e) => setFormData(prev => ({ ...prev, parcial: parseInt(e.target.value) }))}
                required
              >
                <option value="1">Parcial 1</option>
                <option value="2">Parcial 2</option>
                <option value="3">Parcial 3</option>
              </select>

              {/* Temas Planeados */}
              <div className="form-section">
                <label>Temas Planeados *</label>
                {formData.temasPlaneados.map((tema, index) => (
                  <div key={index} className="input-group">
                    <input
                      type="text"
                      placeholder={`Tema planeado ${index + 1}`}
                      value={tema}
                      onChange={(e) => updateTema('temasPlaneados', index, e.target.value)}
                    />
                    {formData.temasPlaneados.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTema('temasPlaneados', index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTema('temasPlaneados')}
                  className="btn-add"
                >
                  + Agregar Tema
                </button>
              </div>

              {/* Temas Cubiertos */}
              <div className="form-section">
                <label>Temas Cubiertos</label>
                {formData.temasCubiertos.map((tema, index) => (
                  <div key={index} className="input-group">
                    <input
                      type="text"
                      placeholder={`Tema cubierto ${index + 1}`}
                      value={tema}
                      onChange={(e) => updateTema('temasCubiertos', index, e.target.value)}
                    />
                    {formData.temasCubiertos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTema('temasCubiertos', index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTema('temasCubiertos')}
                  className="btn-add"
                >
                  + Agregar Tema
                </button>
              </div>

              {/* Actividades Realizadas */}
              <div className="form-section">
                <label>Actividades Realizadas</label>
                {formData.actividadesRealizadas.map((actividad, index) => (
                  <div key={index} className="input-group">
                    <input
                      type="text"
                      placeholder={`Actividad ${index + 1}`}
                      value={actividad}
                      onChange={(e) => updateTema('actividadesRealizadas', index, e.target.value)}
                    />
                    {formData.actividadesRealizadas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTema('actividadesRealizadas', index)}
                        className="btn-remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTema('actividadesRealizadas')}
                  className="btn-add"
                >
                  + Agregar Actividad
                </button>
              </div>

              <textarea
                placeholder="Dificultades encontradas (opcional)"
                value={formData.dificultades}
                onChange={(e) => setFormData(prev => ({ ...prev, dificultades: e.target.value }))}
                rows="3"
              />

              <textarea
                placeholder="Observaciones adicionales (opcional)"
                value={formData.observaciones}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                rows="3"
              />

              <div className="form-note">
                <strong>Nota:</strong> El porcentaje de avance y cumplimiento se calcularán automáticamente 
                en base a los temas planeados vs temas cubiertos.
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Registrar Avance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
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

      {/* Modal de Error */}
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

      {/* Modal de Recordatorio */}
      {showRecordatorioModal && (
        <div className="modal-overlay">
          <div className="modal-container success-modal">
            <div className="modal-icon">⏰</div>
            <h3>Recordatorios Enviados</h3>
            <p>{modalMessage}</p>
            <button
              onClick={() => setShowRecordatorioModal(false)}
              className="btn-primary"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Lista de avances */}
      <div className="avances-list-container">
        <div className="list-header">
          <h2>Avances Registrados ({avances.length})</h2>
          
          {avances.length > 0 && (
            <div className="stats-summary">
              <span className="stat-cumplido">
                ✅ {avances.filter(a => a.cumplimiento === 'cumplido').length} cumplidos
              </span>
              <span className="stat-parcial">
                ⚠️ {avances.filter(a => a.cumplimiento === 'parcial').length} parciales
              </span>
              <span className="stat-no-cumplido">
                ❌ {avances.filter(a => a.cumplimiento === 'no cumplido').length} no cumplidos
              </span>
            </div>
          )}
        </div>
        
        {avances.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <p>No hay avances registrados</p>
            <button
              onClick={() => setShowFormModal(true)}
              className="btn-primary"
            >
              Registrar primer avance
            </button>
          </div>
        ) : (
          <div className="avances-grid">
            {avances.map((avance) => {
              const cumplimientoColor = getCumplimientoColor(avance.cumplimiento)
              const necesitaAtencion = avance.cumplimiento === 'parcial' || avance.cumplimiento === 'no cumplido'
              
              return (
                <div key={avance._id} className={`avance-card ${necesitaAtencion ? 'necesita-atencion' : ''}`}>
                  <div className="card-header">
                    <div className="card-title">
                      <h3>{avance.materia} - Parcial {avance.parcial}</h3>
                      <div className="card-meta">
                        <div><strong>Profesor:</strong> {avance.profesor}</div>
                        <div><strong>Ciclo:</strong> {avance.cicloEscolar}</div>
                        <div><strong>Avance:</strong> {avance.porcentajeAvance}%</div>
                      </div>
                    </div>
                    <div className="card-badges">
                      {necesitaAtencion && (
                        <span className="badge-pendiente">⏰ Pendiente</span>
                      )}
                      <span 
                        className="estado-cumplimiento"
                        style={{
                          background: cumplimientoColor.bg,
                          color: cumplimientoColor.color
                        }}
                      >
                        {avance.cumplimiento.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="temas-grid">
                      <div className="temas-col">
                        <strong>Temas Planeados:</strong>
                        <ul>
                          {avance.temasPlaneados.map((tema, index) => (
                            <li key={index}>{tema}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="temas-col">
                        <strong>Temas Cubiertos:</strong>
                        <ul>
                          {avance.temasCubiertos.map((tema, index) => (
                            <li key={index}>{tema}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {avance.actividadesRealizadas && avance.actividadesRealizadas.length > 0 && (
                      <div className="actividades-section">
                        <strong>Actividades Realizadas:</strong>
                        <ul>
                          {avance.actividadesRealizadas.map((actividad, index) => (
                            <li key={index}>{actividad}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(avance.dificultades || avance.observaciones) && (
                      <div className="observaciones-section">
                        {avance.dificultades && (
                          <div><strong>Dificultades:</strong> {avance.dificultades}</div>
                        )}
                        {avance.observaciones && (
                          <div><strong>Observaciones:</strong> {avance.observaciones}</div>
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

export default AvancesPage