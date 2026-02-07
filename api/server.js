import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------------------------------------------------
   CORS — PERMITE FRONTEND Y RENDER
--------------------------------------------------- */
app.use(cors({
  origin: [
    "https://gabs-projects-frontend.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  credentials: true
}));

app.options("*", cors());

/* ---------------------------------------------------
   BODY PARSERS
--------------------------------------------------- */
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------------
   RUTAS DE ARCHIVOS JSON
--------------------------------------------------- */
const empleadosPath = path.join(__dirname, "data", "empleados.json");
const excepcionesPath = path.join(__dirname, "data", "excepciones.json");

/* ---------------------------------------------------
   GET EMPLEADOS
--------------------------------------------------- */
app.get("/empleados", (req, res) => {
  if (!fs.existsSync(empleadosPath)) {
    return res.status(500).json({ error: "Archivo empleados.json no encontrado" });
  }

  try {
    const empleados = JSON.parse(fs.readFileSync(empleadosPath, "utf8"));
    res.json(empleados);
  } catch {
    res.status(500).json({ error: "Error leyendo empleados.json" });
  }
});

/* ---------------------------------------------------
   LOGIN EMPLEADO
--------------------------------------------------- */
app.post("/login", (req, res) => {
  const { usuario, clave } = req.body;

  const empleados = JSON.parse(fs.readFileSync(empleadosPath, "utf8"));

  const encontrado = empleados.find(
    e => e.usuario === usuario && e.clave === clave
  );

  if (!encontrado) {
    return res.json({ ok: false });
  }

  res.json({
    ok: true,
    id: encontrado.id,
    nombre: encontrado.name
  });
});

/* ---------------------------------------------------
   ADMIN: AGREGAR TAREA
--------------------------------------------------- */
app.post("/admin/agregar-tarea", (req, res) => {
  const { id, fecha, tarea } = req.body;

  if (!id || !fecha || !tarea) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  let excepciones = {};

  if (fs.existsSync(excepcionesPath)) {
    try {
      excepciones = JSON.parse(fs.readFileSync(excepcionesPath, "utf8"));
    } catch {
      excepciones = {};
    }
  }

  if (!excepciones[id]) excepciones[id] = {};
  if (!excepciones[id][fecha]) excepciones[id][fecha] = [];

  excepciones[id][fecha].push({
    id: Date.now().toString(),
    tarea,
    estado: "pendiente",
    obsEmpleado: "",
    obsAdmin: "",
    fotoAntes: "",
    fotoDespues: ""
  });

  fs.writeFileSync(excepcionesPath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   TAREAS DEL DÍA
--------------------------------------------------- */
app.get("/tareas-del-dia/:empleadoId", (req, res) => {
  const { empleadoId } = req.params;
  const { fecha } = req.query;

  if (!fs.existsSync(excepcionesPath)) {
    return res.json({ tareas: [] });
  }

  const excepciones = JSON.parse(fs.readFileSync(excepcionesPath, "utf8"));

  const tareas = excepciones[empleadoId]?.[fecha] || [];

  res.json({ tareas });
});

/* ---------------------------------------------------
   GUARDAR ESTADO
--------------------------------------------------- */
app.post("/guardar-estado", (req, res) => {
  const { empleado, fecha, tarea, estado, motivoNoRealizada } = req.body;

  let excepciones = JSON.parse(fs.readFileSync(excepcionesPath, "utf8"));

  const lista = excepciones[empleado][fecha];
  const t = lista.find(x => x.tarea === tarea);

  if (t) {
    t.estado = estado;
    if (motivoNoRealizada) t.motivoNoRealizada = motivoNoRealizada;
  }

  fs.writeFileSync(excepcionesPath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   GUARDAR OBSERVACIÓN EMPLEADO
--------------------------------------------------- */
app.post("/guardar-observacion", (req, res) => {
  const { empleado, fecha, tarea, observacion } = req.body;

  let excepciones = JSON.parse(fs.readFileSync(excepcionesPath, "utf8"));

  const lista = excepciones[empleado][fecha];
  const t = lista.find(x => x.tarea === tarea);

  if (t) {
    t.obsEmpleado = observacion;
  }

  fs.writeFileSync(excepcionesPath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   SUBIDA DIRECTA DESDE EL FRONTEND (SIN MULTER)
--------------------------------------------------- */
app.post("/empleado/subida-directa", (req, res) => {
  const { empleadoId, fecha, tarea, fotoAntes, fotoDespues, obsEmpleado } = req.body;

  let excepciones = JSON.parse(fs.readFileSync(excepcionesPath, "utf8"));

  if (!excepciones[empleadoId]) excepciones[empleadoId] = {};
  if (!excepciones[empleadoId][fecha]) excepciones[empleadoId][fecha] = [];

  let item = excepciones[empleadoId][fecha].find(x => x.tarea === tarea);

  if (!item) {
    item = { tarea };
    excepciones[empleadoId][fecha].push(item);
  }

  item.fotoAntes = fotoAntes;
  item.fotoDespues = fotoDespues;
  item.obsEmpleado = obsEmpleado || "";
  item.estado = "terminada";

  fs.writeFileSync(excepcionesPath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   INICIAR SERVIDOR
--------------------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
