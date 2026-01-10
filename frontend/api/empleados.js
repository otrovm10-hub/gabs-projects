import empleados from "./data/empleados.json" assert { type: "json" };

export default function handler(req, res) {
  res.status(200).json(empleados);
}
