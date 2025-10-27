import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();
      
      if (token && savedUser) {
        try {
          // Verificar token válido obteniendo perfil
          const profile = await authService.obtenerPerfil();
          setUser(profile.usuario);
        } catch (error) {
          // Token inválido, limpiar localStorage
          console.error('Error verificando autenticación:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await authService.login(email, password);
      setUser(result.usuario);
      return result;
    } catch (error) {
      setError(error.message || 'Error en el login');
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  // Actualizar usuario
  const updateUser = async () => {
    try {
      const profile = await authService.obtenerPerfil();
      setUser(profile.usuario);
      return profile.usuario;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  // Registrar nuevo usuario (solo para admin)
  const registrarUsuario = async (userData) => {
    try {
      setError(null);
      const result = await authService.registrar(userData);
      return result;
    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
      throw error;
    }
  };

  // Obtener lista de usuarios (solo para admin)
  const obtenerUsuarios = async () => {
    try {
      setError(null);
      const result = await authService.obtenerUsuarios();
      return result;
    } catch (error) {
      setError(error.message || 'Error al obtener usuarios');
      throw error;
    }
  };

  // Verificar roles
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return user.rol === roles;
  };

  // Es administrador
  const isAdmin = () => hasRole('admin');
  
  // Es coordinador
  const isCoordinador = () => hasRole(['coordinador', 'admin']);
  
  // Es profesor
  const isProfesor = () => hasRole(['profesor', 'coordinador', 'admin']);

  // Verificar permisos para acciones específicas
  const canManageUsers = () => isAdmin();
  const canViewReports = () => isCoordinador() || isAdmin();
  const canManageContent = () => isProfesor();

  // Limpiar errores
  const clearError = () => setError(null);

  const value = {
    // Estado
    user,
    loading,
    error,
    
    // Autenticación básica
    login,
    logout,
    isAuthenticated: !!user,
    
    // Gestión de usuarios (solo admin)
    registrarUsuario,
    obtenerUsuarios,
    updateUser,
    
    // Verificación de roles
    hasRole,
    isAdmin,
    isCoordinador,
    isProfesor,
    
    // Verificación de permisos
    canManageUsers,
    canViewReports,
    canManageContent,
    
    // Utilidades
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exportación por defecto - SOLO el contexto, no el provider
export default AuthContext;