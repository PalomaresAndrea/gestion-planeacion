import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    isAdmin,
    isCoordinador,
    isProfesor,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;