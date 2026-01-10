import { readJson } from '../_utils/readJson.js';
import { writeJson } from '../_utils/writeJson.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empleadoId, tarea } = req.body;

  const rutina = await readJson('rutina.json');

  if (!rutina[empleadoId]) rutina[empleadoId] = [];
  rutina[empleadoId].push(tarea);

  await writeJson('rutina.json', rutina);

  res.status(200).json({ ok: true });
}
