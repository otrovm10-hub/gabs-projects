import fs from "fs";
import path from "path";

export function writeJson(nombre, data) {
  try {
    const filePath = path.join(process.cwd(), "data", nombre);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return { ok: true };
  } catch (error) {
    console.error("❌ Error escribiendo JSON:", error);
    return { ok: false, error };
  }
}
