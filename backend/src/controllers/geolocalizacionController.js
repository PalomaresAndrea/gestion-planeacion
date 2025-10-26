import axios from "axios";

export const obtenerUbicacion = async (req, res) => {
  try {
    // Ejemplo sencillo: obtener IP del usuario y ubicarlo
    const ipResponse = await axios.get("https://api.ipify.org?format=json");
    const ip = ipResponse.data.ip;

    const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = locationResponse.data;

    res.json({
      ip,
      ciudad: data.city,
      region: data.region,
      pais: data.country_name,
      latitud: data.latitude,
      longitud: data.longitude,
    });
  } catch (error) {
    console.error("Error en geolocalización:", error.message);
    res.status(500).json({ message: "Error al obtener ubicación" });
  }
};
