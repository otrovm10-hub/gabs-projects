import { readJson } from './_utils/readJson.js';
import { writeJson } from './_utils/writeJson.js';
import { getToday } from './_utils/getToday.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empleadoId, observacion } = req.body;
  const fecha = getToday();

  const mensajes = await readJson('mensajes.json');

  if (!mensajes[empleadoId]) mensajes[empleadoId] = {};
  mensajes[empleadoId][fecha] = observacion;

  await writeJson('mensajes.json', mensajes);

  res.status(200).json({ ok: true });
}
