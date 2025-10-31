// src/services/geolocalizacionService.js
export const obtenerUbicacion = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/geolocalizacion"); 
    // Ajusta el puerto según el backend
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener ubicación:", error);
    return null;
  }
};
