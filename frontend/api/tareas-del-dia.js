export default function handler(req, res) {
  const { id, fecha } = req.query;

  const tareas = {
    "EMP001": {
      "2026-01-10": [
        { id: "T001", estado: "pendiente" },
        { id: "T003", estado: "completada" }
      ]
    },
    "EMP002": {
      "2026-01-10": [
        { id: "T002", estado: "pendiente" }
      ]
    }
  };

  const resultado = tareas[id]?.[fecha] || [];

  res.status(200).json(resultado);
}
