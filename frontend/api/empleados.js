export default function handler(req, res) {
  const empleados = [
    { id: "EMP001", nombre: "Juan Pérez" },
    { id: "EMP002", nombre: "María Gómez" },
    { id: "EMP003", nombre: "Carlos López" }
  ];

  res.status(200).json(empleados);
}
