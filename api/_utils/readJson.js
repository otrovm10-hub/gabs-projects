import fs from "fs";
import path from "path";

export function readJson(nombre) {
  try {
    const filePath = path.join(process.cwd(), "data", nombre);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ Archivo no encontrado: ${filePath}`);
      return {};
    }

    const contenido = fs.readFileSync(filePath, "utf8");

    if (!contenido.trim()) {
      console.warn(`⚠ Archivo vacío: ${filePath}`);
      return {};
    }

    return JSON.parse(contenido);
  } catch (error) {
    console.error("❌ Error leyendo JSON:", error);
    return {};
  }
}
