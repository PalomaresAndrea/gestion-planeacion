import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

//antes de ser guardado mongo intercepta ese guardado en una funcion llamada pre save y 
// agrega una cadena de datos aleatoria, en bcrypts.genSalt  
const usuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['profesor', 'coordinador', 'admin'],
    default: 'profesor'
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);  //entre más alto más seguro pero lento 
    this.password = await bcrypt.hash(this.password, salt); //aquí se hashe la contraseña tipo "huella digital"
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Ocultir password en las respuestas
usuarioSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('Usuario', usuarioSchema);