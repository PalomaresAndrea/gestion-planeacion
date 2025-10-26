import mongoose from "mongoose";

const geolocalizacionSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model("Geolocalizacion", geolocalizacionSchema);
