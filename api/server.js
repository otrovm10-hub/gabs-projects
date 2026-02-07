import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------------------------------------------------
   CORS — CORREGIDO PARA PERMITIR FORM-DATA
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
   BODY PARSERS — ORDEN CORRECTO
--------------------------------------------------- */
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------------
   MULTER — MEMORIA (REQUIRED FOR SUPABASE)
--------------------------------------------------- */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------------------------------------------------
   SUPABASE
--------------------------------------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ---------------------------------------------------
   RUTA: OBTENER EMPLEADOS
--------------------------------------------------- */
app.get("/empleados", (req, res) => {
  const filePath = path.join(__dirname, "data", "empleados.json");

  if (!fs.existsSync(filePath)) {
    return res.status(500).json({ error: "Archivo empleados.json no encontrado" });
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const empleados = JSON.parse(data);
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: "Error leyendo empleados.json" });
  }
});

/* ---------------------------------------------------
   LOGIN EMPLEADO
--------------------------------------------------- */
app.post("/login", (req, res) => {
  const { usuario, clave } = req.body;

  const filePath = path.join(__dirname, "data", "empleados.json");
  const empleados = JSON.parse(fs.readFileSync(filePath, "utf8"));

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
   AGREGAR TAREA (ADMIN)
--------------------------------------------------- */
app.post("/admin/agregar-tarea", (req, res) => {
  const { id, fecha, tarea } = req.body;

  if (!id || !fecha || !tarea) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const filePath = path.join(__dirname, "data", "excepciones.json");

  let excepciones = {};

  if (fs.existsSync(filePath)) {
    try {
      excepciones = JSON.parse(fs.readFileSync(filePath, "utf8"));
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

  fs.writeFileSync(filePath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   TAREAS DEL DÍA
--------------------------------------------------- */
app.get("/tareas-del-dia/:empleadoId", (req, res) => {
  const { empleadoId } = req.params;
  const { fecha } = req.query;

  const filePath = path.join(__dirname, "data", "excepciones.json");

  if (!fs.existsSync(filePath)) {
    return res.json({ tareas: [] });
  }

  const excepciones = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const tareas = excepciones[empleadoId]?.[fecha] || [];

  res.json({ tareas });
});

/* ---------------------------------------------------
   GUARDAR ESTADO
--------------------------------------------------- */
app.post("/guardar-estado", (req, res) => {
  const { empleado, fecha, tarea, estado, motivoNoRealizada } = req.body;

  const filePath = path.join(__dirname, "data", "excepciones.json");
  let excepciones = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const lista = excepciones[empleado][fecha];
  const t = lista.find(x => x.tarea === tarea);

  if (t) {
    t.estado = estado;
    if (motivoNoRealizada) t.motivoNoRealizada = motivoNoRealizada;
  }

  fs.writeFileSync(filePath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   GUARDAR OBSERVACIÓN EMPLEADO
--------------------------------------------------- */
app.post("/guardar-observacion", (req, res) => {
  const { empleado, fecha, tarea, observacion } = req.body;

  const filePath = path.join(__dirname, "data", "excepciones.json");
  let excepciones = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const lista = excepciones[empleado][fecha];
  const t = lista.find(x => x.tarea === tarea);

  if (t) {
    t.obsEmpleado = observacion;
  }

  fs.writeFileSync(filePath, JSON.stringify(excepciones, null, 2));

  res.json({ ok: true });
});

/* ---------------------------------------------------
   SUBIR FOTOS A SUPABASE (CORREGIDO)
--------------------------------------------------- */
app.post(
  "/empleado/subir-tarea",
  upload.fields([
    { name: "fotoAntes", maxCount: 1 },
    { name: "fotoDespues", maxCount: 1 }
  ]),
  async (req, res) => {

    console.log("FILES RECIBIDOS:", req.files);

    const { empleadoId, fecha, tarea, obsEmpleado } = req.body;

    const fotoAntes = req.files?.fotoAntes?.[0];
    const fotoDespues = req.files?.fotoDespues?.[0];

    if (!fotoAntes || !fotoDespues) {
      return res.status(400).json({ error: "Faltan fotos" });
    }

    try {
      const nombreAntes = `empleados/${empleadoId}/${fecha}/${tarea}-antes-${Date.now()}.jpg`;
      const nombreDespues = `empleados/${empleadoId}/${fecha}/${tarea}-despues-${Date.now()}.jpg`;

      const bucket = process.env.SUPABASE_BUCKET;

      await supabase.storage
        .from(bucket)
        .upload(nombreAntes, fotoAntes.buffer, {
          contentType: fotoAntes.mimetype
        });

      await supabase.storage
        .from(bucket)
        .upload(nombreDespues, fotoDespues.buffer, {
          contentType: fotoDespues.mimetype
        });

      const urlAntes = supabase.storage.from(bucket).getPublicUrl(nombreAntes).data.publicUrl;
      const urlDespues = supabase.storage.from(bucket).getPublicUrl(nombreDespues).data.publicUrl;

      const filePath = path.join(__dirname, "data", "excepciones.json");
      let excepciones = JSON.parse(fs.readFileSync(filePath, "utf8"));

      const lista = excepciones[empleadoId][fecha];
      const t = lista.find(x => x.tarea === tarea);

      if (t) {
        t.fotoAntes = urlAntes;
        t.fotoDespues = urlDespues;
        t.obsEmpleado = obsEmpleado || "";
        t.estado = "terminada";
      }

      fs.writeFileSync(filePath, JSON.stringify(excepciones, null, 2));

      res.json({ ok: true, urlAntes, urlDespues });

    } catch (error) {
      console.error("Error subiendo fotos:", error);
      res.status(500).json({ error: "Error subiendo fotos" });
    }
  }
);

/* ---------------------------------------------------
   INICIAR SERVIDOR
--------------------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
