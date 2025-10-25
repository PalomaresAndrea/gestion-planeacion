import mongoose from 'mongoose';

const evidenciaSchema = new mongoose.Schema({
  profesor: { 
    type: String, 
    required: true 
  },
  nombreCurso: { 
    type: String, 
    required: true 
  },
  institucion: { 
    type: String, 
    required: true 
  },
  fechaInicio: { 
    type: Date, 
    required: true 
  },
  fechaFin: { 
    type: Date, 
    required: true 
  },
  horasAcreditadas: { 
    type: Number, 
    required: true,
    min: 1
  },
  tipoCapacitacion: {
    type: String,
    enum: ['curso', 'taller', 'diplomado', 'seminario', 'congreso', 'otro'],
    required: true,
    default: 'curso'
  },
  archivo: { 
    type: String, 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'validada', 'rechazada'], 
    default: 'pendiente' 
  },
  observaciones: {
    type: String,
    default: ''
  },
  coordinadorValidador: {
    type: String,
    default: ''
  },
  fechaValidacion: {
    type: Date
  },
  cicloEscolar: {
    type: String,
    required: true,
    default: () => {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
  },
  fechaSubida: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('Evidencia', evidenciaSchema);