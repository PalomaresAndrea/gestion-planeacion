import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🧩 INTERCEPTOR PARA AGREGAR TOKEN JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 🧩 INTERCEPTOR PARA MANEJAR ERRORES DE AUTENTICACIÓN
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

//
// 🧩 SERVICIOS DE AUTENTICACIÓN
//
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registrar: (userData) => api.post('/auth/registrar', userData),
  obtenerPerfil: () => api.get('/auth/perfil'),
  actualizarPerfil: (userData) => api.put('/auth/perfil', userData),
}

//
// 🧩 SERVICIOS DE PLANEACIONES
//
export const planeacionService = {
  getAll: (filters = {}) => api.get('/planeaciones', { params: filters }),
  getById: (id) => api.get(`/planeaciones/${id}`),
  create: (formData) =>
    api.post('/planeaciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.put(`/planeaciones/${id}`, data),
  revisar: (id, data) => api.put(`/planeaciones/${id}/revisar`, data),
  getCicloActual: () => api.get('/planeaciones/ciclo-actual'),
  getHistorial: (profesor, materia) =>
    api.get('/planeaciones/historial', { params: { profesor, materia } }),
  descargarArchivo: (id) =>
    api.get(`/planeaciones/${id}/archivo`, { responseType: 'blob' }),
  verArchivo: (id) =>
    api.get(`/planeaciones/${id}/ver`, { responseType: 'blob' }),
}

//
// 🧩 SERVICIOS DE AVANCES (CON APROBACIÓN)
//
export const avanceService = {
  getAll: (filters = {}) => api.get('/avances', { params: filters }),
  getById: (id) => api.get(`/avances/${id}`),
  create: (data) => api.post('/avances', data),
  update: (id, data) => api.put(`/avances/${id}`, data),
  delete: (id) => api.delete(`/avances/${id}`),
  aprobarEvidencia: (id, data) => api.put(`/avances/${id}/aprobar`, data),
  getEstadisticasProfesor: (profesor, ciclo) =>
    api.get('/avances/estadisticas-profesor', { params: { profesor, ciclo } }),
  getReporteGeneral: (ciclo) =>
    api.get('/avances/reporte-general', { params: { ciclo } }),
  getDatosGraficas: (ciclo) =>
    api.get('/avances/graficas', { params: { ciclo } }),
  enviarRecordatorios: (ciclo) => api.post('/avances/recordatorios', { ciclo }),
}

//
// 🧩 SERVICIOS DE EVIDENCIAS
//
export const evidenciaService = {
  getAll: (filters = {}) => api.get('/evidencias', { params: filters }),
  getById: (id) => api.get(`/evidencias/${id}`),
  create: (data) => api.post('/evidencias', data),
  update: (id, data) => api.put(`/evidencias/${id}`, data),
  validar: (id, data) => api.put(`/evidencias/${id}/validar`, data),
  delete: (id) => api.delete(`/evidencias/${id}`),
  buscar: (query) => api.get('/evidencias/buscar', { params: { q: query } }),
  getEstadisticasProfesor: (profesor, ciclo) =>
    api.get('/evidencias/estadisticas-profesor', { params: { profesor, ciclo } }),
  getReporteGeneral: (ciclo) =>
    api.get('/evidencias/reporte-general', { params: { ciclo } }),
}

//
// 🧩 SERVICIOS DE REPORTES
//
export const reporteService = {
  getInstitucional: (ciclo) =>
    api.get('/reportes/institucional', { params: { ciclo } }),
  getPorProfesor: (profesor, ciclo) =>
    api.get('/reportes/profesor', { params: { profesor, ciclo } }),
  exportar: (formato, tipo, ciclo, profesor) =>
    api.get('/reportes/exportar', {
      params: { formato, tipo, ciclo, profesor },
    }),
}

//
// 🧩 SERVICIOS DE NOTIFICACIONES
//
export const notificacionService = {
  enviarRecordatorios: (ciclo) => api.post('/avances/recordatorios', { ciclo }),
  enviarAlertaCoordinadores: (data) => api.post('/notificaciones/alertas', data),
  getEstadoNotificaciones: () => api.get('/notificaciones/estado'),
}

export default api
