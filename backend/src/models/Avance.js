import mongoose from 'mongoose';

const avanceSchema = new mongoose.Schema({
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
  temasPlaneados: {
    type: [String],
    required: true
  },
  temasCubiertos: {
    type: [String],
    required: true
  },
  porcentajeAvance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  cumplimiento: { 
    type: String, 
    enum: ['cumplido', 'parcial', 'no cumplido'], 
    required: true 
  },
  actividadesRealizadas: {
    type: [String],
    default: []
  },
  dificultades: {
    type: String
  },
  observaciones: { 
    type: String 
  },
  fechaRegistro: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Método para calcular porcentaje automáticamente
avanceSchema.methods.calcularPorcentaje = function() {
  if (this.temasPlaneados.length === 0) return 0;
  return Math.round((this.temasCubiertos.length / this.temasPlaneados.length) * 100);
};

// Middleware para actualizar porcentaje antes de guardar
avanceSchema.pre('save', function(next) {
  this.porcentajeAvance = this.calcularPorcentaje();
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.model('Avance', avanceSchema);