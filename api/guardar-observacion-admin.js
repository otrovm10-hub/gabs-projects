import { readJson } from './_utils/readJson.js';
import { writeJson } from './_utils/writeJson.js';
import { getToday } from './_utils/getToday.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { empleadoId, observacion } = req.body;
  const fecha = getToday();

  const pendientes = await readJson('PendientesAdmin.json');

  if (!pendientes[empleadoId]) pendientes[empleadoId] = {};
  pendientes[empleadoId][fecha] = observacion;

  await writeJson('PendientesAdmin.json', pendientes);

  res.status(200).json({ ok: true });
}
