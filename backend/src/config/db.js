import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Función asíncrona para conectar a la base de datos MongoDB
export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    // Conectamos a MongoDB usando la URI proporcionada en las variables de entorno
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,      // Analizador de URL moderno
      useUnifiedTopology: true,   // Usar el motor de topología unificada de MongoDB
    });

    // Mostramos en consola el host al que se conectó correctamente
    console.log(` MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(' Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};
