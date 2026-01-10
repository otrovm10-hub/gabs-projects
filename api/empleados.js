import { readJson } from './_utils/readJson.js';

export default async function handler(req, res) {
  const empleados = await readJson('empleados.json');
  res.status(200).json(empleados);
}
