import express from "express";
import { obtenerUbicacion } from "../controllers/geolocalizacionController.js";

const router = express.Router();

router.get("/", obtenerUbicacion);

export default router;
