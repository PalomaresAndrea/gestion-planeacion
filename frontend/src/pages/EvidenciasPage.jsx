import React, { useState, useEffect } from 'react'
import { evidenciaService } from '../services/api'

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
      pendiente: { bg: '#fff3cd', color: '#856404' },
      validada: { bg: '#d4edda', color: '#155724' },
      rechazada: { bg: '#f8d7da', color: '#721c24' }
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

  if (loading) {
    return <div>Cargando evidencias...</div>
  }

  return (
    <div>
      <header style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Evidencias de Capacitación</h1>
            <p style={{ margin: 0, color: '#7f8c8d' }}>Gestión de cursos y talleres docentes</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            + Nueva Evidencia
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3>Filtros</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select 
            value={filters.estado || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="validada">Validada</option>
            <option value="rechazada">Rechazada</option>
          </select>

          <select 
            value={filters.tipo || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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
            placeholder="Filtrar por profesor..."
            value={filters.profesor || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, profesor: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />

          <button
            onClick={() => setFilters({})}
            style={{
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Formulario de nueva evidencia */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3>Registrar Nueva Evidencia</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input
                type="text"
                placeholder="Profesor"
                value={formData.profesor}
                onChange={(e) => setFormData(prev => ({ ...prev, profesor: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Nombre del curso/taller"
                value={formData.nombreCurso}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreCurso: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input
                type="text"
                placeholder="Institución"
                value={formData.institucion}
                onChange={(e) => setFormData(prev => ({ ...prev, institucion: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select
                value={formData.tipoCapacitacion}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoCapacitacion: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="curso">Curso</option>
                <option value="taller">Taller</option>
                <option value="diplomado">Diplomado</option>
                <option value="seminario">Seminario</option>
                <option value="congreso">Congreso</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input
                type="date"
                placeholder="Fecha de inicio"
                value={formData.fechaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="date"
                placeholder="Fecha de fin"
                value={formData.fechaFin}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input
                type="number"
                placeholder="Horas acreditadas"
                value={formData.horasAcreditadas}
                onChange={(e) => setFormData(prev => ({ ...prev, horasAcreditadas: parseInt(e.target.value) }))}
                required
                min="1"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="Archivo (nombre o URL)"
                value={formData.archivo}
                onChange={(e) => setFormData(prev => ({ ...prev, archivo: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <textarea
              placeholder="Observaciones (opcional)"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Registrar Evidencia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de evidencias */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
          Evidencias Registradas ({evidencias.length})
        </h2>
        
        {evidencias.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#95a5a6',
            border: '2px dashed #bdc3c7',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
            <p>No hay evidencias registradas</p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Registrar primera evidencia
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {evidencias.map((evidencia) => {
              const estadoColor = getEstadoColor(evidencia.estado)
              const tipoIcon = getTipoIcon(evidencia.tipoCapacitacion)
              
              return (
                <div key={evidencia._id} style={{
                  padding: '20px',
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  background: '#fafbfc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{tipoIcon}</span>
                        <h3 style={{ margin: 0, color: '#2c3e50' }}>
                          {evidencia.nombreCurso}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div>
                          <strong>Profesor:</strong> {evidencia.profesor}
                        </div>
                        <div>
                          <strong>Institución:</strong> {evidencia.institucion}
                        </div>
                        <div>
                          <strong>Horas:</strong> {evidencia.horasAcreditadas}h
                        </div>
                        <div>
                          <strong>Fecha:</strong> {new Date(evidencia.fechaInicio).toLocaleDateString()} - {new Date(evidencia.fechaFin).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: estadoColor.bg,
                        color: estadoColor.color
                      }}>
                        {evidencia.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div>
                      <strong>Tipo:</strong> {evidencia.tipoCapacitacion}
                    </div>
                    <div>
                      <strong>Archivo:</strong> {evidencia.archivo}
                    </div>
                    <div>
                      <strong>Ciclo:</strong> {evidencia.cicloEscolar}
                    </div>
                  </div>

                  {evidencia.observaciones && (
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '4px',
                      marginBottom: '15px',
                      borderLeft: '4px solid #3498db'
                    }}>
                      <strong>Observaciones:</strong> {evidencia.observaciones}
                    </div>
                  )}

                  {/* Acciones para coordinadores */}
                  {evidencia.estado === 'pendiente' && (
                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e1e8ed', paddingTop: '15px' }}>
                      <button
                        onClick={() => handleValidar(evidencia._id, 'validada')}
                        style={{
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Validar
                      </button>
                      <button
                        onClick={() => handleValidar(evidencia._id, 'rechazada')}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}

                  {evidencia.coordinadorValidador && (
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#7f8c8d',
                      borderTop: '1px solid #e1e8ed',
                      paddingTop: '10px'
                    }}>
                      <strong>Validado por:</strong> {evidencia.coordinadorValidador} 
                      {evidencia.fechaValidacion && (
                        <> el {new Date(evidencia.fechaValidacion).toLocaleDateString()}</>
                      )}
                    </div>
                  )}
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