import { readJson } from '../_utils/readJson.js';
import { writeJson } from '../_utils/writeJson.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empleadoId, fecha, tarea } = req.body;

  const excepciones = await readJson('excepciones.json');

  if (!excepciones[empleadoId]) excepciones[empleadoId] = {};
  if (!excepciones[empleadoId][fecha]) excepciones[empleadoId][fecha] = [];

  excepciones[empleadoId][fecha].push(tarea);

  await writeJson('excepciones.json', excepciones);

  res.status(200).json({ ok: true });
}
