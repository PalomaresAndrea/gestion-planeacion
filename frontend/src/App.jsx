import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import PlaneacionesPage from './pages/PlaneacionesPage'
import AvancesPage from './pages/AvancesPage'
import EvidenciasPage from './pages/EvidenciasPage'
import ReportesPage from './pages/ReportesPage'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planeaciones" element={<PlaneacionesPage />} />
          <Route path="/avances" element={<AvancesPage />} />
          <Route path="/evidencias" element={<EvidenciasPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App