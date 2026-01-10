import { readJson } from './_utils/readJson.js';
import { writeJson } from './_utils/writeJson.js';
import { getToday } from './_utils/getToday.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empleadoId, tareaId, estado } = req.body;
  const fecha = getToday();

  const historial = await readJson('Historial.json');

  if (!historial[empleadoId]) historial[empleadoId] = {};
  if (!historial[empleadoId][fecha]) historial[empleadoId][fecha] = [];

  historial[empleadoId][fecha].push({
    tareaId,
    estado,
    timestamp: Date.now()
  });

  await writeJson('Historial.json', historial);

  res.status(200).json({ ok: true });
}
