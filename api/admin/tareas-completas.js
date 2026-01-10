import { readJson } from '../_utils/readJson.js';

export default async function handler(req, res) {
  const historial = await readJson('Historial.json');
  res.status(200).json(historial);
}
