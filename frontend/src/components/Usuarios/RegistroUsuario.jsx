import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Hash, Building, Phone, BookOpen } from 'lucide-react';
import authService from '../../services/authService';
import './RegistroUsuario.css';

const RegistroUsuario = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'profesor',
    numeroEmpleado: '',
    departamento: '',
    telefono: '',
    especialidad: '',
    materias: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Preparar datos para enviar
      const userData = {
        ...formData,
        materias: formData.materias ? formData.materias.split(',').map(m => m.trim()) : []
      };

      await authService.registrar(userData);
      
      setMessage({
        type: 'success',
        text: 'Usuario registrado exitosamente'
      });
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        nombre: '',
        rol: 'profesor',
        numeroEmpleado: '',
        departamento: '',
        telefono: '',
        especialidad: '',
        materias: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al registrar usuario'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-usuario-container">
      <div className="registro-usuario-header">
        <UserPlus size={24} />
        <h2>Registrar Nuevo Usuario</h2>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registro-usuario-form">
        <div className="form-grid">
          {/* Información Básica */}
          <div className="form-section">
            <h3>Información Básica</h3>
            
            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="input-group">
              <label>Rol del usuario:</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="profesor">Profesor</option>
                <option value="coordinador">Coordinador</option>
              </select>
            </div>
          </div>

          {/* Información de Profesor (mostrar solo si es profesor) */}
          {formData.rol === 'profesor' && (
            <div className="form-section">
              <h3>Información de Profesor</h3>
              
              <div className="input-group">
                <Hash size={18} />
                <input
                  type="text"
                  name="numeroEmpleado"
                  placeholder="Número de empleado"
                  value={formData.numeroEmpleado}
                  onChange={handleChange}
                  required={formData.rol === 'profesor'}
                />
              </div>

              <div className="input-group">
                <Building size={18} />
                <input
                  type="text"
                  name="departamento"
                  placeholder="Departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required={formData.rol === 'profesor'}
                />
              </div>

              <div className="input-group">
                <Phone size={18} />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <BookOpen size={18} />
                <input
                  type="text"
                  name="especialidad"
                  placeholder="Especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Materias (separadas por comas):</label>
                <textarea
                  name="materias"
                  placeholder="Matemáticas, Física, Química..."
                  value={formData.materias}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar Usuario'}
        </button>
      </form>
    </div>
  );
};

export default RegistroUsuario;