import mongoose from 'mongoose';

const profesorSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  numeroEmpleado: {
    type: String,
    required: true,
    unique: true
  },
  departamento: {
    type: String,
    required: true
  },
  telefono: {
    type: String
  },
  especialidad: {
    type: String
  },
  materias: [{
    type: String
  }],
  fechaIngreso: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas frecuentes
profesorSchema.index({ usuario: 1, numeroEmpleado: 1 });

export default mongoose.model('Profesor', profesorSchema);