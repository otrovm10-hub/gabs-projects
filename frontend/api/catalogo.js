export default function handler(req, res) {
  const catalogo = [
    { id: "T001", nombre: "Lavar platos" },
    { id: "T002", nombre: "Limpiar mesas" },
    { id: "T003", nombre: "Atender clientes" }
  ];

  res.status(200).json(catalogo);
}
