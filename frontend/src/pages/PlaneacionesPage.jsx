import React, { useState, useEffect } from 'react'
import { planeacionService } from '../services/api'

const PlaneacionesPage = () => {
  const [planeaciones, setPlaneaciones] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return <div>Cargando planeaciones...</div>
  }

  return (
    <div>
      <header style={{ marginBottom: '30px' }}>
        <h1>Gestión de Planeaciones</h1>
        <p>Administra las planeaciones didácticas</p>
      </header>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Lista de Planeaciones ({planeaciones.length})</h2>
        
        {planeaciones.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No hay planeaciones registradas
          </p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {planeaciones.map((planeacion) => (
              <div key={planeacion._id} style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                background: '#f9f9f9'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>
                  {planeacion.materia} - Parcial {planeacion.parcial}
                </h3>
                <p style={{ margin: '5px 0' }}>
                  <strong>Profesor:</strong> {planeacion.profesor}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Estado:</strong> 
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    marginLeft: '8px',
                    background: 
                      planeacion.estado === 'aprobado' ? '#d4edda' :
                      planeacion.estado === 'pendiente' ? '#fff3cd' : '#f8d7da',
                    color: 
                      planeacion.estado === 'aprobado' ? '#155724' :
                      planeacion.estado === 'pendiente' ? '#856404' : '#721c24'
                  }}>
                    {planeacion.estado}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaneacionesPage