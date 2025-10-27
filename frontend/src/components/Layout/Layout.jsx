import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  BarChart2,
  Folder,
  ClipboardList,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./LayoutStyles.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { user, logout, isCoordinador, isAdmin } = useAuth();

  const navItems = [
    { path: "/", label: "Inicio", icon: <Home size={18} /> },
    { path: "/planeaciones", label: "Planeaciones", icon: <FileText size={18} /> },
    { path: "/avances", label: "Avances", icon: <BarChart2 size={18} /> },
    { path: "/evidencias", label: "Evidencias", icon: <Folder size={18} /> },
  ];

  // Solo coordinadores y admin pueden ver reportes
  if (isCoordinador() || isAdmin()) {
    navItems.push({
      path: "/reportes", 
      label: "Reportes", 
      icon: <ClipboardList size={18} />
    });
  }

  // Solo admin puede ver gestión de usuarios
  if (isAdmin()) {
    navItems.push({
      path: "/usuarios",
      label: "Gestión de Usuarios",
      icon: <Users size={18} />
    });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUserRoleText = () => {
    switch(user?.rol) {
      case 'admin': return 'Administrador';
      case 'coordinador': return 'Coordinador';
      case 'profesor': return 'Profesor';
      default: return 'Usuario';
    }
  };

  const getUserInitials = () => {
    if (!user?.nombre) return 'U';
    return user.nombre
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar-modern ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Sistema</h2>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => setSidebarOpen(true)}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {sidebarOpen && user && (
          <div className="sidebar-footer">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <p className="user-name">{user.nombre || user.email}</p>
              <p className="user-role">{getUserRoleText()}</p>
            </div>
            <div className="user-menu-container">
              <button 
                className="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <Settings size={16} />
              </button>
              
              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <div className="user-avatar-small">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="user-name">{user.nombre || user.email}</p>
                      <p className="user-role">{getUserRoleText()}</p>
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button 
                    className="user-menu-item logout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="main-modern">
        {/* Header móvil */}
        <div className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div className="mobile-user-info">
            <span>{user?.nombre || user?.email}</span>
            <button 
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        
        {children}
      </main>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;