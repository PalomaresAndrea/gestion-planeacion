import React, { useState, useEffect } from 'react'
import { reporteService, planeacionService, avanceService, evidenciaService } from '../services/api'

const Dashboard = () => {
  const [reporte, setReporte] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [reporteRes, planeacionesRes, avancesRes, evidenciasRes] = await Promise.all([
        reporteService.getInstitucional(),
        planeacionService.getAll(),
        avanceService.getAll(),
        evidenciaService.getAll()
      ])
      
      setReporte(reporteRes.data)
      
      // Estadísticas rápidas
      setStats({
        planeacionesPendientes: planeacionesRes.data.filter(p => p.estado === 'pendiente').length,
        avancesRecientes: avancesRes.data.slice(0, 5),
        evidenciasRecientes: evidenciasRes.data.slice(0, 5)
      })
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Cargando dashboard...</div>
      </div>
    )
  }

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }

  const metricCardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }

  return (
    <div>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Dashboard Institucional</h1>
        <p style={{ margin: 0, color: '#7f8c8d' }}>Resumen general del sistema académico</p>
      </header>

      {reporte && (
        <>
          {/* Tarjetas de estadísticas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👨‍🏫</div>
              <h3 style={{ fontSize: '1.5rem', margin: '10px 0', color: '#2c3e50' }}>
                {reporte.resumenGeneral.totalProfesores}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>Profesores Activos</p>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', margin: '10px 0', color: '#2c3e50' }}>
                {reporte.resumenGeneral.totalPlaneaciones}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>Planeaciones</p>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📈</div>
              <h3 style={{ fontSize: '1.5rem', margin: '10px 0', color: '#2c3e50' }}>
                {reporte.resumenGeneral.totalAvances}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>Avances Registrados</p>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</div>
              <h3 style={{ fontSize: '1.5rem', margin: '10px 0', color: '#2c3e50' }}>
                {reporte.resumenGeneral.totalEvidencias}
              </h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>Evidencias</p>
            </div>
          </div>

          {/* Métricas de rendimiento */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={metricCardStyle}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📊 Planeaciones</h3>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#27ae60',
                marginBottom: '10px'
              }}>
                {reporte.planeaciones.porcentajeAprobacion}%
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>Tasa de Aprobación</p>
              <div style={{ fontSize: '0.9rem', color: '#95a5a6' }}>
                <div>Aprobadas: {reporte.planeaciones.aprobadas}</div>
                <div>Pendientes: {reporte.planeaciones.pendientes}</div>
                <div>Rechazadas: {reporte.planeaciones.rechazadas}</div>
              </div>
            </div>

            <div style={metricCardStyle}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📈 Avances</h3>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#3498db',
                marginBottom: '10px'
              }}>
                {reporte.avances.porcentajeCumplimiento}%
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>Cumplimiento General</p>
              <div style={{ fontSize: '0.9rem', color: '#95a5a6' }}>
                <div>Cumplidos: {reporte.avances.cumplido}</div>
                <div>Parciales: {reporte.avances.parcial}</div>
                <div>No cumplidos: {reporte.avances.noCumplido}</div>
              </div>
            </div>

            <div style={metricCardStyle}>
              <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>🎓 Capacitación</h3>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#9b59b6',
                marginBottom: '10px'
              }}>
                {reporte.capacitacionDocente.totalHorasAcreditadas}h
              </div>
              <p style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>Horas Acreditadas</p>
              <div style={{ fontSize: '0.9rem', color: '#95a5a6' }}>
                <div>Cursos: {reporte.capacitacionDocente.totalCursos}</div>
                <div>Validados: {reporte.capacitacionDocente.cursosValidadas}</div>
                <div>Promedio: {reporte.capacitacionDocente.promedioHorasPorProfesor}h/profesor</div>
              </div>
            </div>
          </div>

          {/* Distribución por parcial */}
          <div style={metricCardStyle}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📅 Distribución por Parcial</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              textAlign: 'center'
            }}>
              {[1, 2, 3].map(parcial => (
                <div key={parcial}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                    Parcial {parcial}
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <div>Planeaciones: {reporte.porParcial[parcial]?.planeaciones || 0}</div>
                    <div>Avances: {reporte.porParcial[parcial]?.avances || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard