import React, { useState, useEffect } from 'react'
import { avanceService } from '../services/api'

const AvancesPage = () => {
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showForm, setShowForm] = useState(false)
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
      // Filtrar arrays vacíos
      const dataToSend = {
        ...formData,
        temasPlaneados: formData.temasPlaneados.filter(tema => tema.trim() !== ''),
        temasCubiertos: formData.temasCubiertos.filter(tema => tema.trim() !== ''),
        actividadesRealizadas: formData.actividadesRealizadas.filter(act => act.trim() !== ''),
        cumplimiento: 'parcial' // Se calculará automáticamente
      }
      
      await avanceService.create(dataToSend)
      setShowForm(false)
      setFormData({
        profesor: '', materia: '', parcial: 1,
        temasPlaneados: [''], temasCubiertos: [''],
        actividadesRealizadas: [''], dificultades: '', observaciones: ''
      })
      loadAvances()
      alert('Avance registrado exitosamente')
    } catch (error) {
      alert('Error al registrar avance')
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

  const getCumplimientoColor = (cumplimiento) => {
    const colors = {
      cumplido: { bg: '#d4edda', color: '#155724' },
      parcial: { bg: '#fff3cd', color: '#856404' },
      no_cumplido: { bg: '#f8d7da', color: '#721c24' }
    }
    return colors[cumplimiento] || colors.parcial
  }

  if (loading) {
    return <div>Cargando avances...</div>
  }

  return (
    <div>
      <header style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Control de Avances</h1>
            <p style={{ margin: 0, color: '#7f8c8d' }}>Seguimiento del avance por parcial</p>
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
            + Registrar Avance
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
            value={filters.cumplimiento || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, cumplimiento: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Todos los estados</option>
            <option value="cumplido">Cumplido</option>
            <option value="parcial">Parcial</option>
            <option value="no cumplido">No Cumplido</option>
          </select>

          <select 
            value={filters.parcial || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, parcial: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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

      {/* Formulario de nuevo avance */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3>Registrar Nuevo Avance</h3>
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
                placeholder="Materia"
                value={formData.materia}
                onChange={(e) => setFormData(prev => ({ ...prev, materia: e.target.value }))}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <select
              value={formData.parcial}
              onChange={(e) => setFormData(prev => ({ ...prev, parcial: parseInt(e.target.value) }))}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>

            {/* Temas Planeados */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Temas Planeados
              </label>
              {formData.temasPlaneados.map((tema, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder={`Tema planeado ${index + 1}`}
                    value={tema}
                    onChange={(e) => updateTema('temasPlaneados', index, e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd' 
                    }}
                  />
                  {formData.temasPlaneados.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTema('temasPlaneados', index)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTema('temasPlaneados')}
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Agregar Tema
              </button>
            </div>

            {/* Temas Cubiertos */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Temas Cubiertos
              </label>
              {formData.temasCubiertos.map((tema, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder={`Tema cubierto ${index + 1}`}
                    value={tema}
                    onChange={(e) => updateTema('temasCubiertos', index, e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd' 
                    }}
                  />
                  {formData.temasCubiertos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTema('temasCubiertos', index)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTema('temasCubiertos')}
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Agregar Tema
              </button>
            </div>

            {/* Actividades Realizadas */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Actividades Realizadas
              </label>
              {formData.actividadesRealizadas.map((actividad, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder={`Actividad ${index + 1}`}
                    value={actividad}
                    onChange={(e) => updateTema('actividadesRealizadas', index, e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd' 
                    }}
                  />
                  {formData.actividadesRealizadas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTema('actividadesRealizadas', index)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addTema('actividadesRealizadas')}
                style={{
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Agregar Actividad
              </button>
            </div>

            <textarea
              placeholder="Dificultades encontradas (opcional)"
              value={formData.dificultades}
              onChange={(e) => setFormData(prev => ({ ...prev, dificultades: e.target.value }))}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minHeight: '60px',
                resize: 'vertical'
              }}
            />

            <textarea
              placeholder="Observaciones adicionales (opcional)"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minHeight: '60px',
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
                Registrar Avance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de avances */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
          Avances Registrados ({avances.length})
        </h2>
        
        {avances.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#95a5a6',
            border: '2px dashed #bdc3c7',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📈</div>
            <p>No hay avances registrados</p>
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
              Registrar primer avance
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {avances.map((avance) => {
              const cumplimientoColor = getCumplimientoColor(avance.cumplimiento)
              return (
                <div key={avance._id} style={{
                  padding: '20px',
                  border: '1px solid #e1e8ed',
                  borderRadius: '8px',
                  background: '#fafbfc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                        {avance.materia} - Parcial {avance.parcial}
                      </h3>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div>
                          <strong>Profesor:</strong> {avance.profesor}
                        </div>
                        <div>
                          <strong>Ciclo:</strong> {avance.cicloEscolar}
                        </div>
                        <div>
                          <strong>Avance:</strong> {avance.porcentajeAvance}%
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: cumplimientoColor.bg,
                        color: cumplimientoColor.color
                      }}>
                        {avance.cumplimiento.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Temas y actividades */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <div>
                      <strong>Temas Planeados:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {avance.temasPlaneados.map((tema, index) => (
                          <li key={index}>{tema}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Temas Cubiertos:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {avance.temasCubiertos.map((tema, index) => (
                          <li key={index}>{tema}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {avance.actividadesRealizadas && avance.actividadesRealizadas.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>Actividades Realizadas:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {avance.actividadesRealizadas.map((actividad, index) => (
                          <li key={index}>{actividad}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(avance.dificultades || avance.observaciones) && (
                    <div style={{ 
                      background: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '4px',
                      borderLeft: '4px solid #3498db'
                    }}>
                      {avance.dificultades && (
                        <div><strong>Dificultades:</strong> {avance.dificultades}</div>
                      )}
                      {avance.observaciones && (
                        <div><strong>Observaciones:</strong> {avance.observaciones}</div>
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

export default AvancesPage