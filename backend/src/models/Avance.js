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
    default: []
  },
  temasCubiertos: {
    type: [String],
    default: []
  },
  porcentajeAvance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  cumplimiento: { 
    type: String, 
    enum: ['cumplido', 'parcial', 'no cumplido'], 
    default: 'parcial'
  },
  actividadesRealizadas: {
    type: [String],
    default: []
  },
  dificultades: {
    type: String,
    default: ''
  },
  observaciones: { 
    type: String,
    default: ''
  },
  fechaRegistro: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },

  // NUEVOS CAMPOS PARA APROBACIÓN
  estadoAprobacion: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  aprobado: {
    type: Boolean,
    default: false
  },
  comentariosAprobacion: {
    type: String,
    default: ''
  },
  revisadoPor: {
    type: String,
    default: ''
  },
  fechaRevision: {
    type: Date,
    default: null
  },
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, { timestamps: true });

// Método para calcular el porcentaje automáticamente
avanceSchema.methods.calcularPorcentaje = function() {
  if (this.temasPlaneados.length === 0) return 0;
  const porcentaje = Math.round((this.temasCubiertos.length / this.temasPlaneados.length) * 100);
  return Math.min(100, Math.max(0, porcentaje));
};

// Método para determinar el cumplimiento
avanceSchema.methods.determinarCumplimiento = function() {
  const porcentaje = this.porcentajeAvance;
  if (porcentaje >= 90) return 'cumplido';
  if (porcentaje >= 60) return 'parcial';
  return 'no cumplido';
};

// Middleware: antes de guardar, actualiza porcentaje y cumplimiento
avanceSchema.pre('save', function(next) {
  this.porcentajeAvance = this.calcularPorcentaje();
  this.cumplimiento = this.determinarCumplimiento();
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.model('Avance', avanceSchema, 'avances');
