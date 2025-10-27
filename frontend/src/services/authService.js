import api from './api.js';

const authService = {
  // Login de usuario
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Registro de usuario (solo admin)
  registrar: async (userData) => {
    try {
      const response = await api.post('/auth/registrar', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Obtener perfil del usuario
  obtenerPerfil: async () => {
    try {
      const response = await api.get('/auth/perfil');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Actualizar perfil
  actualizarPerfil: async (userData) => {
    try {
      const response = await api.put('/auth/perfil', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;