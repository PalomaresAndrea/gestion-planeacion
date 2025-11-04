import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import PlaneacionesPage from './pages/PlaneacionesPage'
import AvancesPage from './pages/AvancesPage'
import EvidenciasPage from './pages/EvidenciasPage'
import ReportesPage from './pages/ReportesPage'
import Login from './pages/Login'
import UsuariosPage from './pages/UsuariosPage'
import Geolocalizacion from "./components/geolocalizacion/Geolocalizacion"
import './App.css'

// 🔒 Rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <div className="loading">Cargando...</div>
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// 🎫 Rutas públicas como login
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="loading">Cargando...</div>

  return !isAuthenticated ? children : <Navigate to="/" replace />
}

// 📦 Layout solo si está logueado
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <>{children}</>
  )
}

function AppContent() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/planeaciones" element={
          <ProtectedRoute>
            <PlaneacionesPage />
          </ProtectedRoute>
        } />

        <Route path="/avances" element={
          <ProtectedRoute>
            <AvancesPage />
          </ProtectedRoute>
        } />

        <Route path="/evidencias" element={
          <ProtectedRoute>
            <EvidenciasPage />
          </ProtectedRoute>
        } />

        <Route path="/reportes" element={
          <ProtectedRoute>
            <ReportesPage />
          </ProtectedRoute>
        } />

        <Route path="/usuarios" element={
          <ProtectedRoute>
            <UsuariosPage />
          </ProtectedRoute>
        } />

        {/* ✅ NUEVA RUTA GEOBLALIZACIÓN */}
        <Route path="/geolocalizacion" element={
          <ProtectedRoute>
            <Geolocalizacion />
          </ProtectedRoute>
        } />

        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Redirección */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
