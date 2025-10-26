import React, { useState, useEffect } from 'react'
import { evidenciaService } from '../services/api'
import '../styles/EvidenciasStyles.css'

const EvidenciasPage = () => {
  const [evidencias, setEvidencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
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
    try {
      await evidenciaService.create(formData)
      setShowForm(false)
      setFormData({
        profesor: '', nombreCurso: '', institucion: '',
        fechaInicio: '', fechaFin: '', horasAcreditadas: '',
        tipoCapacitacion: 'curso', archivo: '', observaciones: ''
      })
      loadEvidencias()
      alert('Evidencia registrada exitosamente')
    } catch (error) {
      alert('Error al registrar evidencia')
    }
  }

  const handleValidar = async (id, estado) => {
    try {
      await evidenciaService.validar(id, {
        estado,
        coordinadorValidador: 'Coordinador Académico',
        observaciones: `Evidencia ${estado}`
      })
      loadEvidencias()
      alert(`Evidencia ${estado} exitosamente`)
    } catch (error) {
      alert('Error al validar evidencia')
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
      curso: '',
      taller: '🔧', 
      diplomado: '🎓',
      seminario: '💬',
      congreso: '🏛️',
      otro: '📄'
    }
    return icons[tipo] || icons.otro
  }

  if (loading) return <div className="loading">Cargando evidencias...</div>

  return (
    <div className="evidencias-container">
      {/* Header */}
      <header className="evidencias-header">
        <h1> Evidencias de Capacitación</h1>
        <p>Gestión de cursos, talleres y formación docente</p>
      </header>

      {/* Filtros */}
      <div className="filters-card">
        <h3>Filtros y Búsqueda</h3>
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

          <input
            type="text"
            placeholder="Buscar por profesor..."
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

      {/* Botón de nueva evidencia */}
      <div className="actions-bar">
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Nueva Evidencia
        </button>
        <span className="results-count">{evidencias.length} resultados</span>
      </div>

      {/* Formulario de nueva evidencia */}
      {showForm && (
        <div className="form-modal">
          <div className="form-container">
            <div className="form-header">
              <h3>Registrar Nueva Evidencia</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="evidence-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Profesor *</label>
                  <input
                    type="text"
                    placeholder="Nombre del profesor"
                    value={formData.profesor}
                    onChange={(e) => setFormData(prev => ({ ...prev, profesor: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nombre del Curso/Taller *</label>
                  <input
                    type="text"
                    placeholder="Ej: Curso de Innovación Educativa"
                    value={formData.nombreCurso}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombreCurso: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Institución *</label>
                  <input
                    type="text"
                    placeholder="Ej: Universidad Nacional"
                    value={formData.institucion}
                    onChange={(e) => setFormData(prev => ({ ...prev, institucion: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Capacitación *</label>
                  <select
                    value={formData.tipoCapacitacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoCapacitacion: e.target.value }))}
                    required
                  >
                    <option value="curso">Curso</option>
                    <option value="taller">Taller</option>
                    <option value="diplomado">Diplomado</option>
                    <option value="seminario">Seminario</option>
                    <option value="congreso">Congreso</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin *</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Horas Acreditadas *</label>
                  <input
                    type="number"
                    placeholder="Ej: 40"
                    value={formData.horasAcreditadas}
                    onChange={(e) => setFormData(prev => ({ ...prev, horasAcreditadas: parseInt(e.target.value) }))}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Archivo o Enlace *</label>
                  <input
                    type="text"
                    placeholder="Nombre del archivo o URL"
                    value={formData.archivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, archivo: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Observaciones</label>
                <textarea
                  placeholder="Observaciones adicionales (opcional)"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Registrar Evidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de evidencias */}
      <div className="evidencias-list">
        {evidencias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>No hay evidencias registradas</p>
            <button
              onClick={() => setShowForm(true)}
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
                      <span className="tipo-icon">{tipoIcon}</span>
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
                        <strong>Horas:</strong> {evidencia.horasAcreditadas}h
                      </div>
                      <div className="detail-item">
                        <strong>Tipo:</strong> {evidencia.tipoCapacitacion}
                      </div>
                      <div className="detail-item">
                        <strong>Fecha:</strong> {new Date(evidencia.fechaInicio).toLocaleDateString()} - {new Date(evidencia.fechaFin).toLocaleDateString()}
                      </div>
                      <div className="detail-item">
                        <strong>Archivo:</strong> 
                        <span className="archivo">{evidencia.archivo}</span>
                      </div>
                    </div>

                    {evidencia.observaciones && (
                      <div className="observaciones">
                        <strong>Observaciones:</strong> {evidencia.observaciones}
                      </div>
                    )}

                    {evidencia.estado === 'pendiente' && (
                      <div className="acciones">
                        <button
                          onClick={() => handleValidar(evidencia._id, 'validada')}
                          className="btn aprobar"
                        >
                          ✅ Validar
                        </button>
                        <button
                          onClick={() => handleValidar(evidencia._id, 'rechazada')}
                          className="btn rechazar"
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    )}

                    {evidencia.coordinadorValidador && (
                      <div className="validacion-info">
                        <strong>Validado por:</strong> {evidencia.coordinadorValidador} 
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