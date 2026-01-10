import { readJson } from '../_utils/readJson.js';
import { writeJson } from '../_utils/writeJson.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empleadoId, fecha, tareaId } = req.body;

  const historial = await readJson('Historial.json');

  historial[empleadoId][fecha] = historial[empleadoId][fecha].filter(
    t => t.tareaId !== tareaId
  );

  await writeJson('Historial.json', historial);

  res.status(200).json({ ok: true });
}
