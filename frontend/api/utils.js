import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function cargarJSON(nombre) {
  const filePath = path.join(__dirname, "data", nombre);

  if (!fs.existsSync(filePath)) return {};
  const contenido = fs.readFileSync(filePath, "utf8").trim();
  if (contenido === "") return {};
  return JSON.parse(contenido);
}
