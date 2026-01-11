import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { fecha } = req.query;

  const filePath = path.join(process.cwd(), "data", "excepciones.json");

  if (!fs.existsSync(filePath)) {
    return res.status(200).json([]);
  }

  let excepciones = {};

  try {
    excepciones = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    excepciones = {};
  }

  const resultado = [];

  // Recorrer todos los empleados
  Object.entries(excepciones).forEach(([empleadoId, fechas]) => {
    if (fechas[fecha]) {
      fechas[fecha].forEach(t => {
        resultado.push({
          empleadoId,
          fecha,
          ...t
        });
      });
    }
  });

  return res.status(200).json(resultado);
}
