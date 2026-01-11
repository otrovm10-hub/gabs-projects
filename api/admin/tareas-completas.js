import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { fecha } = req.query;

  const filePath = path.join(process.cwd(), "data", "Historial.json");

  if (!fs.existsSync(filePath)) {
    return res.status(200).json([]); // ← SI NO EXISTE, DEVOLVER ARRAY VACÍO
  }

  const raw = fs.readFileSync(filePath, "utf8");

  let historial = [];

  try {
    historial = JSON.parse(raw);
    if (!Array.isArray(historial)) historial = []; // ← ASEGURAR ARRAY
  } catch (e) {
    historial = []; // ← SI HAY ERROR, DEVOLVER ARRAY VACÍO
  }

  const tareas = historial.filter(t => t.fecha === fecha);

  return res.status(200).json(tareas); // ← SIEMPRE DEVOLVER ARRAY
}
