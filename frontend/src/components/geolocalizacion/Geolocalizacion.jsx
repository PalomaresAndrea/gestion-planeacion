import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";


export default function Geolocalizacion() {
  const [ubicacion, setUbicacion] = useState(null);

  // Coordenadas exactas de tu dirección
  const escuelaCoords = {
    lat: 21.15266,
    lon: -100.93539,
    ciudad: "Dolores Hidalgo",
    pais: "México",
    direccion: "Educación Tecnológica 34, Fracc. Universidad, Dolores Hidalgo"
  };

  useEffect(() => {
    axios.get("http://localhost:4000/api/geolocalizacion")
      .then(res => setUbicacion(res.data))
      .catch(() => {
        // Si falla usa la ubicación fija
        setUbicacion(escuelaCoords);
      });
  }, []);

  if (!ubicacion) return <p>📡 Cargando mapa...</p>;

  const lat = ubicacion.latitud || ubicacion.lat;
  const lon = ubicacion.longitud || ubicacion.lon;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <h2>📍 Ubicación</h2>

      <MapContainer
        center={[lat, lon]}
        zoom={17}
        style={{ height: "450px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[lat, lon]}>
          <Popup>
            🎓 {ubicacion.direccion || `${ubicacion.ciudad}, ${ubicacion.pais}`}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
