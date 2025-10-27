import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  AlertTriangle,
  Save,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RegistroUsuario from '../components/Usuarios/RegistroUsuario';
import './UsuariosPage.css';

const UsuariosPage = () => {
  const { user, obtenerUsuarios, registrarUsuario, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('registrar');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar usuarios cuando se active la pestaña de listar
  useEffect(() => {
    if (activeTab === 'listar') {
      cargarUsuarios();
    }
  }, [activeTab]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const resultado = await obtenerUsuarios();
      setUsuarios(resultado.usuarios || []);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de eliminar
  const abrirModalEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowDeleteModal(true);
  };

  // Abrir modal de editar
  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setEditFormData({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      rol: usuario.rol || 'profesor',
      numeroEmpleado: usuario.perfilProfesor?.numeroEmpleado || '',
      departamento: usuario.perfilProfesor?.departamento || '',
      telefono: usuario.perfilProfesor?.telefono || '',
      especialidad: usuario.perfilProfesor?.especialidad || '',
      materias: usuario.perfilProfesor?.materias?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  // Cerrar modales
  const cerrarModales = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setUsuarioSeleccionado(null);
    setEditFormData({});
    setSaving(false);
  };

  // Eliminar usuario
  const eliminarUsuario = async () => {
    try {
      setSaving(true);
      // Aquí iría la llamada a la API para eliminar el usuario
      // await authService.eliminarUsuario(usuarioSeleccionado._id);
      
      // Por ahora, simulamos la eliminación
      setUsuarios(prev => prev.filter(u => u._id !== usuarioSeleccionado._id));
      
      cerrarModales();
      // Mostrar mensaje de éxito
      setError('');
    } catch (err) {
      setError(err.message || 'Error al eliminar usuario');
    } finally {
      setSaving(false);
    }
  };

  // Editar usuario
  const editarUsuario = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Preparar datos para enviar
      const userData = {
        ...editFormData,
        materias: editFormData.materias ? editFormData.materias.split(',').map(m => m.trim()) : []
      };

      // Aquí iría la llamada a la API para actualizar el usuario
      // await authService.actualizarUsuario(usuarioSeleccionado._id, userData);
      
      // Por ahora, simulamos la actualización
      setUsuarios(prev => prev.map(u => 
        u._id === usuarioSeleccionado._id 
          ? { 
              ...u, 
              nombre: userData.nombre,
              email: userData.email,
              rol: userData.rol,
              perfilProfesor: {
                ...u.perfilProfesor,
                numeroEmpleado: userData.numeroEmpleado,
                departamento: userData.departamento,
                telefono: userData.telefono,
                especialidad: userData.especialidad,
                materias: userData.materias
              }
            } 
          : u
      ));
      
      cerrarModales();
      // Mostrar mensaje de éxito
      setError('');
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRolTexto = (rol) => {
    const roles = {
      'admin': 'Administrador',
      'coordinador': 'Coordinador',
      'profesor': 'Profesor'
    };
    return roles[rol] || rol;
  };

  const getRolColor = (rol) => {
    const colores = {
      'admin': 'var(--color-admin)',
      'coordinador': 'var(--color-coordinador)',
      'profesor': 'var(--color-profesor)'
    };
    return colores[rol] || '#666';
  };

  // Solo administradores pueden acceder a esta página
  if (user?.rol !== 'admin') {
    return (
      <div className="usuarios-page">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div className="header-title">
          <Users size={28} />
          <h1>Gestión de Usuarios</h1>
        </div>
      </div>

      <div className="usuarios-content">
        <div className="usuarios-sidebar">
          <nav className="usuarios-nav">
            <button 
              className={`nav-item ${activeTab === 'registrar' ? 'active' : ''}`}
              onClick={() => setActiveTab('registrar')}
            >
              <UserPlus size={18} />
              <span>Registrar Usuario</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'listar' ? 'active' : ''}`}
              onClick={() => setActiveTab('listar')}
            >
              <Search size={18} />
              <span>Ver Usuarios</span>
            </button>
          </nav>
        </div>

        <div className="usuarios-main">
          {activeTab === 'registrar' && <RegistroUsuario />}
          
          {activeTab === 'listar' && (
            <div className="listar-usuarios">
              <div className="usuarios-toolbar">
                <h3>Lista de Usuarios</h3>
                <button 
                  className="refresh-btn"
                  onClick={cargarUsuarios}
                  disabled={loading}
                >
                  <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                  {loading ? 'Cargando...' : 'Actualizar'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="loading-state">
                  <RefreshCw size={24} className="spinning" />
                  <p>Cargando usuarios...</p>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <h4>No hay usuarios registrados</h4>
                  <p>Comienza registrando el primer usuario</p>
                </div>
              ) : (
                <div className="usuarios-grid">
                  {usuarios.map((usuario) => (
                    <div key={usuario._id} className="usuario-card">
                      <div className="usuario-header">
                        <div className="usuario-avatar">
                          {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="usuario-info">
                          <h4 className="usuario-nombre">{usuario.nombre}</h4>
                          <p className="usuario-email">{usuario.email}</p>
                        </div>
                        <span 
                          className="usuario-rol"
                          style={{ backgroundColor: getRolColor(usuario.rol) }}
                        >
                          {getRolTexto(usuario.rol)}
                        </span>
                      </div>
                      
                      {usuario.rol === 'profesor' && usuario.perfilProfesor && (
                        <div className="usuario-details">
                          <p><strong>N° Empleado:</strong> {usuario.perfilProfesor.numeroEmpleado}</p>
                          <p><strong>Departamento:</strong> {usuario.perfilProfesor.departamento}</p>
                          {usuario.perfilProfesor.especialidad && (
                            <p><strong>Especialidad:</strong> {usuario.perfilProfesor.especialidad}</p>
                          )}
                          {usuario.perfilProfesor.materias && usuario.perfilProfesor.materias.length > 0 && (
                            <p><strong>Materias:</strong> {usuario.perfilProfesor.materias.join(', ')}</p>
                          )}
                        </div>
                      )}

                      <div className="usuario-actions">
                        <button 
                          className="btn-edit" 
                          title="Editar usuario"
                          onClick={() => abrirModalEditar(usuario)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-delete" 
                          title="Eliminar usuario"
                          onClick={() => abrirModalEliminar(usuario)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación para Eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <div className="modal-icon danger">
                <AlertTriangle size={24} />
              </div>
              <h3>Confirmar Eliminación</h3>
              <button className="modal-close" onClick={cerrarModales}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que deseas eliminar al usuario{' '}
                <strong>{usuarioSeleccionado?.nombre}</strong> ({usuarioSeleccionado?.email})?
              </p>
              <p className="warning-text">
                Esta acción no se puede deshacer y se perderán todos los datos del usuario.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={cerrarModales}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={eliminarUsuario}
                disabled={saving}
              >
                {saving ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <div className="modal-icon primary">
                <User size={24} />
              </div>
              <h3>Editar Usuario</h3>
              <button className="modal-close" onClick={cerrarModales}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editarUsuario}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-section">
                    <h4>Información Básica</h4>
                    <div className="input-group">
                      <label>Nombre completo *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={editFormData.nombre || ''}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email || ''}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Rol *</label>
                      <select
                        name="rol"
                        value={editFormData.rol || 'profesor'}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="profesor">Profesor</option>
                        <option value="coordinador">Coordinador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>

                  {editFormData.rol === 'profesor' && (
                    <div className="form-section">
                      <h4>Información de Profesor</h4>
                      <div className="input-group">
                        <label>Número de empleado *</label>
                        <input
                          type="text"
                          name="numeroEmpleado"
                          value={editFormData.numeroEmpleado || ''}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Departamento *</label>
                        <input
                          type="text"
                          name="departamento"
                          value={editFormData.departamento || ''}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={editFormData.telefono || ''}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="input-group">
                        <label>Especialidad</label>
                        <input
                          type="text"
                          name="especialidad"
                          value={editFormData.especialidad || ''}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="input-group">
                        <label>Materias (separadas por comas)</label>
                        <textarea
                          name="materias"
                          value={editFormData.materias || ''}
                          onChange={handleEditChange}
                          rows="3"
                          placeholder="Matemáticas, Física, Química..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={cerrarModales}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary" 
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;