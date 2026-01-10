import { readJson } from './_utils/readJson.js';
import { getToday } from './_utils/getToday.js';

export default async function handler(req, res) {
  const { empleadoId } = req.query;
  const fecha = getToday();

  const rutina = await readJson('rutina.json');
  const excepciones = await readJson('excepciones.json');

  const tareasEmpleado = rutina[empleadoId] || [];
  const excepcion = excepciones[empleadoId]?.[fecha] || [];

  const tareasFinales = [...tareasEmpleado, ...excepcion];

  res.status(200).json(tareasFinales);
}
