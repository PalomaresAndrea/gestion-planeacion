import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  BarChart2,
  Folder,
  ClipboardList,
  Menu,
  X,
  User,
} from "lucide-react";
import "./LayoutStyles.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/planeaciones", label: "Planeaciones", icon: <FileText size={18} /> },
    { path: "/avances", label: "Avances", icon: <BarChart2 size={18} /> },
    { path: "/evidencias", label: "Evidencias", icon: <Folder size={18} /> },
    { path: "/reportes", label: "Reportes", icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar-modern ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">🎓 Sistema</h2>
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
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <User size={20} />
            <div>
              <p className="user-name">Administrador</p>
              <p className="user-role">Sistema</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="main-modern">{children}</main>
    </div>
  );
};

export default Layout;