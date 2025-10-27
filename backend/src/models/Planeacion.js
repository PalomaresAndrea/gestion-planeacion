import mongoose from 'mongoose';

const planeacionSchema = new mongoose.Schema({
  profesor: { 
    type: String, 
    required: true 
  },
  materia: { 
    type: String, 
    required: true 
  },
  parcial: { 
    type: Number, 
    required: true,
    min: 1,
    max: 3
  },
  cicloEscolar: {
    type: String,
    required: true,
    default: () => {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${currentYear + 1}`;
    }
  },
  archivo: { 
    type: String,
    required: true 
  },
  archivoOriginal: {
    type: String,
    required: true
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'aprobado', 'rechazado', 'ajustes_solicitados'], 
    default: 'pendiente' 
  },
  observaciones: { 
    type: String,
    default: '' 
  },
  coordinadorRevisor: {
    type: String,
    default: ''
  },
  fechaRevision: {
    type: Date
  },
  fechaSubida: { 
    type: Date, 
    default: Date.now 
  },
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Planeacion', planeacionSchema, 'planeaciones');