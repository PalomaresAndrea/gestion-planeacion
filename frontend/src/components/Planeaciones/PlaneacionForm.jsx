import React, { useState } from 'react';
import { planeacionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './PlaneacionForm.css';

const PlaneacionForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    materia: '',
    parcial: 1,
    cicloEscolar: '',
    archivo: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [archivoNombre, setArchivoNombre] = useState('');

  const { user, isProfesor } = useAuth();

  // Generar ciclo escolar actual por defecto
  const getCicloActual = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe exceder 10MB');
        return;
      }

      setFormData(prev => ({ ...prev, archivo: file }));
      setArchivoNombre(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (!formData.materia) {
        throw new Error('La materia es requerida');
      }
      if (!formData.archivo) {
        throw new Error('Debe seleccionar un archivo PDF');
      }

      // Crear FormData para enviar archivo
      const submitData = new FormData();
      
      // Para coordinadores/admin, permitir especificar profesor
      if (!isProfesor()) {
        submitData.append('profesor', formData.profesor || '');
      }
      
      submitData.append('materia', formData.materia);
      submitData.append('parcial', formData.parcial.toString());
      submitData.append('cicloEscolar', formData.cicloEscolar || getCicloActual());
      submitData.append('archivo', formData.archivo);

      console.log('Enviando planeación...', {
        materia: formData.materia,
        parcial: formData.parcial,
        cicloEscolar: formData.cicloEscolar || getCicloActual(),
        archivo: formData.archivo.name
      });

      const response = await planeacionService.create(submitData);
      
      // Limpiar formulario
      setFormData({
        materia: '',
        parcial: 1,
        cicloEscolar: '',
        archivo: null
      });
      setArchivoNombre('');

      // Ejecutar callback de éxito
      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {
      console.error('Error al crear planeación:', error);
      setError(error.response?.data?.message || error.message || 'Error al crear planeación');
    } finally {
      setLoading(false);
    }
  };

  const materiasComunes = [
    'Matemáticas I',
    'Matemáticas II',
    'Matemáticas III',
    'Cálculo Diferencial',
    'Cálculo Integral',
    'Álgebra Lineal',
    'Estadística',
    'Física I',
    'Física II',
    'Química General',
    'Programación',
    'Inglés',
    'Español',
    'Historia',
    'Geografía',
    'Biología',
    'Filosofía'
  ];

  return (
    <div className="planeacion-form-container">
      <div className="form-header">
        <h2>📋 Nueva Planeación Didáctica</h2>
        <p>Completa los datos para registrar tu planeación</p>
      </div>

      {error && (
        <div className="error-message">
          <span>❌</span>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="planeacion-form">
        {/* Campo profesor solo para coordinadores/admin */}
        {!isProfesor() && (
          <div className="form-group">
            <label htmlFor="profesor">👨‍🏫 Profesor *</label>
            <input
              type="text"
              id="profesor"
              name="profesor"
              value={formData.profesor || ''}
              onChange={handleInputChange}
              placeholder="Nombre del profesor"
              required={!isProfesor()}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="materia">📚 Materia *</label>
          <select
            id="materia"
            name="materia"
            value={formData.materia}
            onChange={handleInputChange}
            required
          >
            <option value="">Selecciona una materia</option>
            {materiasComunes.map((materia) => (
              <option key={materia} value={materia}>
                {materia}
              </option>
            ))}
            <option value="otra">Otra materia...</option>
          </select>
          {formData.materia === 'otra' && (
            <input
              type="text"
              name="materiaCustom"
              placeholder="Especifica la materia"
              onChange={(e) => setFormData(prev => ({ ...prev, materia: e.target.value }))}
              className="materia-custom-input"
            />
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="parcial">📅 Parcial *</label>
            <select
              id="parcial"
              name="parcial"
              value={formData.parcial}
              onChange={handleInputChange}
              required
            >
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cicloEscolar">🎓 Ciclo Escolar *</label>
            <input
              type="text"
              id="cicloEscolar"
              name="cicloEscolar"
              value={formData.cicloEscolar || getCicloActual()}
              onChange={handleInputChange}
              placeholder="Ej: 2024-2025"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="archivo">📎 Archivo PDF *</label>
          <div className="file-upload-area">
            <input
              type="file"
              id="archivo"
              name="archivo"
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="file-input"
              required
            />
            <label htmlFor="archivo" className="file-label">
              <div className="file-icon">📄</div>
              <div className="file-text">
                <strong>Seleccionar archivo PDF</strong>
                <span>Haz clic o arrastra un archivo aquí</span>
                <small>Máximo 10MB - Solo PDF</small>
              </div>
            </label>
            {archivoNombre && (
              <div className="file-selected">
                <span>✅ Archivo seleccionado:</span>
                <strong>{archivoNombre}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-small"></div>
                Subiendo...
              </>
            ) : (
              '📤 Subir Planeación'
            )}
          </button>
        </div>

        <div className="form-note">
          <p><strong>💡 Nota:</strong> La planeación será enviada para revisión y aparecerá con estado "Pendiente". 
          {isProfesor() && ' El coordinador revisará tu planeación y te notificará el resultado.'}</p>
        </div>
      </form>
    </div>
  );
};

export default PlaneacionForm;