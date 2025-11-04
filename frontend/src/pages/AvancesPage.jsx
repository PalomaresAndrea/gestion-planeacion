import React, { useState, useEffect } from 'react'
import { avanceService, notificacionService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/AvancesStyles.css'

const AvancesPage = () => {
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [showFormModal, setShowFormModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showRecordatorioModal, setShowRecordatorioModal] = useState(false)
  const [showAprobarModal, setShowAprobarModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [formData, setFormData] = useState({
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
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(null)
  const [comentariosAprobacion, setComentariosAprobacion] = useState('')
  const [enviandoAprobacion, setEnviandoAprobacion] = useState(false)

  const { user, isCoordinador, isAdmin, isProfesor } = useAuth()

  useEffect(() => {
    loadAvances()
  }, [filters])

  const loadAvances = async () => {
    try {
      setLoading(true)
      const response = await avanceService.getAll(filters)
      setAvances(response.data)
    } catch (error) {
      console.error('Error cargando avances:', error)
      setModalMessage('Error al cargar los avances')
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const aprobarEvidencia = async (aprobado) => {
    if (!avanceSeleccionado) return

    try {
      setEnviandoAprobacion(true)
      const data = {
        aprobado,
        comentarios: comentariosAprobacion,
        revisadoPor: user.nombre || user.email
      }

      await avanceService.aprobarEvidencia(avanceSeleccionado._id, data)

      setModalMessage(
        aprobado
          ? '✅ Evidencia aprobada exitosamente. Se ha notificado al profesor.'
          : '❌ Evidencia rechazada. Se ha notificado al profesor.'
      )
      setShowSuccessModal(true)
      setShowAprobarModal(false)
      setAvanceSeleccionado(null)
      setComentariosAprobacion('')
      loadAvances()
    } catch (error) {
      console.error('Error al aprobar evidencia:', error)
      setModalMessage(
        'Error al procesar la aprobación: ' +
          (error.response?.data?.message || error.message)
      )
      setShowErrorModal(true)
    } finally {
      setEnviandoAprobacion(false)
    }
  }

  const abrirModalAprobacion = (avance) => {
    setAvanceSeleccionado(avance)
    setComentariosAprobacion(avance.comentariosAprobacion || '')
    setShowAprobarModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = isProfesor()
        ? {
            materia: formData.materia,
            parcial: formData.parcial,
            temasPlaneados: formData.temasPlaneados.filter(
              (tema) => tema.trim() !== ''
            ),
            temasCubiertos: formData.temasCubiertos.filter(
              (tema) => tema.trim() !== ''
            ),
            actividadesRealizadas: formData.actividadesRealizadas.filter(
              (act) => act.trim() !== ''
            ),
            dificultades: formData.dificultades,
            observaciones: formData.observaciones
          }
        : {
            profesor: formData.profesor,
            materia: formData.materia,
            parcial: formData.parcial,
            temasPlaneados: formData.temasPlaneados.filter(
              (tema) => tema.trim() !== ''
            ),
            temasCubiertos: formData.temasCubiertos.filter(
              (tema) => tema.trim() !== ''
            ),
            actividadesRealizadas: formData.actividadesRealizadas.filter(
              (act) => act.trim() !== ''
            ),
            dificultades: formData.dificultades,
            observaciones: formData.observaciones
          }

      await avanceService.create(dataToSend)
      setShowFormModal(false)
      resetForm()
      loadAvances()
      setModalMessage('Avance registrado exitosamente')
      setShowSuccessModal(true)
    } catch (error) {
      setModalMessage(
        'Error al registrar avance: ' +
          (error.response?.data?.message || error.message)
      )
      setShowErrorModal(true)
    }
  }

  const enviarRecordatorios = async () => {
    try {
      if (!isCoordinador() && !isAdmin()) {
        alert('No tienes permisos para enviar recordatorios')
        return
      }

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
    setFormData((prev) => ({
      ...prev,
      [campo]: [...prev[campo], '']
    }))
  }

  const removeTema = (campo, index) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: prev[campo].filter((_, i) => i !== index)
    }))
  }

  const updateTema = (campo, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: prev[campo].map((item, i) => (i === index ? value : item))
    }))
  }

  const resetForm = () => {
    setFormData({
      profesor: '',
      materia: '',
      parcial: 1,
      temasPlaneados: [''],
      temasCubiertos: [''],
      actividadesRealizadas: [''],
      dificultades: '',
      observaciones: ''
    })
  }

  const getCumplimientoColor = (cumplimiento) => {
    const colors = {
      cumplido: { bg: '#e8f8ec', color: '#1e7e34' },
      parcial: { bg: '#fff8e1', color: '#a68b00' },
      'no cumplido': { bg: '#fdecea', color: '#a71d2a' }
    }
    return colors[cumplimiento] || colors.parcial
  }

  const puedeAprobarEvidencias = () => isCoordinador() || isAdmin()

  const avancesPendientesAprobacion = avances.filter(
    (a) => a.estadoAprobacion === 'pendiente'
  ).length

  const avancesPendientes = avances.filter(
    (a) => a.cumplimiento === 'parcial' || a.cumplimiento === 'no cumplido'
  ).length

  const profesoresConPendientes = [
    ...new Set(
      avances
        .filter(
          (a) => a.cumplimiento === 'parcial' || a.cumplimiento === 'no cumplido'
        )
        .map((a) => a.profesor)
    )
  ]

  const puedeEnviarRecordatorios = () =>
    (isCoordinador() || isAdmin()) && avancesPendientes > 0

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Cargando avances...</p>
      </div>
    )
  }

  return (
    <div className="avances-page">
      <h2>Gestión de Avances</h2>

      <div className="actions">
        {isProfesor() && (
          <button onClick={() => setShowFormModal(true)}>Registrar avance</button>
        )}
        {puedeEnviarRecordatorios() && (
          <button
            onClick={enviarRecordatorios}
            disabled={enviandoRecordatorios}
            className="btn-recordatorio"
          >
            {enviandoRecordatorios ? 'Enviando...' : 'Enviar recordatorios'}
          </button>
        )}
      </div>

      <div className="avances-list">
        {avances.length === 0 ? (
          <p>No hay avances registrados</p>
        ) : (
          avances.map((avance) => {
            const color = getCumplimientoColor(avance.cumplimiento)
            return (
              <div
                key={avance._id}
                className="avance-card"
                style={{ backgroundColor: color.bg, color: color.color }}
              >
                <h4>{avance.materia}</h4>
                <p><strong>Profesor:</strong> {avance.profesor}</p>
                <p><strong>Parcial:</strong> {avance.parcial}</p>
                <p><strong>Cumplimiento:</strong> {avance.cumplimiento}</p>
                <p><strong>Observaciones:</strong> {avance.observaciones}</p>

                {puedeAprobarEvidencias() && (
                  <button onClick={() => abrirModalAprobacion(avance)}>
                    Aprobar/Rechazar evidencia
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal para aprobación */}
      {showAprobarModal && avanceSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h3>Revisión de Evidencia</h3>
            <p>
              <strong>Materia:</strong> {avanceSeleccionado.materia}
            </p>
            <p>
              <strong>Profesor:</strong> {avanceSeleccionado.profesor}
            </p>
            <textarea
              value={comentariosAprobacion}
              onChange={(e) => setComentariosAprobacion(e.target.value)}
              placeholder="Escriba comentarios..."
            />
            <div className="modal-actions">
              <button
                className="btn-approve"
                onClick={() => aprobarEvidencia(true)}
                disabled={enviandoAprobacion}
              >
                Aprobar
              </button>
              <button
                className="btn-reject"
                onClick={() => aprobarEvidencia(false)}
                disabled={enviandoAprobacion}
              >
                Rechazar
              </button>
              <button onClick={() => setShowAprobarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvancesPage
