export default function handler(req, res) {
  const historial = [
    {
      empleado: "EMP001",
      tarea: "Lavar platos",
      fecha: "2026-01-09",
      estado: "completada"
    },
    {
      empleado: "EMP002",
      tarea: "Limpiar mesas",
      fecha: "2026-01-08",
      estado: "completada"
    }
  ];

  res.status(200).json(historial);
}
