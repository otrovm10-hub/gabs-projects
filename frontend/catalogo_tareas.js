import { readJson } from './_utils/readJson.js';

export default async function handler(req, res) {
  const catalogo = await readJson('catalogo_tareas.json');
  res.status(200).json(catalogo);
}
