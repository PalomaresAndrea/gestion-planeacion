import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/planeaciones', label: 'Planeaciones', icon: '📝' },
    { path: '/avances', label: 'Avances', icon: '📈' },
    { path: '/evidencias', label: 'Evidencias', icon: '📁' },
    { path: '/reportes', label: 'Reportes', icon: '📋' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: '250px',
        background: '#2c3e50',
        color: 'white',
        padding: '20px 0'
      }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #34495e', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>🎓 Gestión Académica</h2>
        </div>
        <ul style={{ listStyle: 'none' }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '5px' }}>
              <Link 
                to={item.path} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  color: location.pathname === item.path ? 'white' : '#bdc3c7',
                  textDecoration: 'none',
                  background: location.pathname === item.path ? '#3498db' : 'transparent',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ marginRight: '10px', fontSize: '1.1rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <main style={{ 
        flex: 1, 
        padding: '20px', 
        background: '#ecf0f1',
        overflowY: 'auto'
      }}>
        {children}
      </main>
    </div>
  )
}

export default Layout