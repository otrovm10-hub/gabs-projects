// ===============================
//  CARGA INICIAL
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarEmpleados();
  await cargarCatalogo();
  inicializarCalendario();
});

// ===============================
//  CARGAR EMPLEADOS
// ===============================

async function cargarEmpleados() {
  const res = await fetch("/api/empleados");
  const empleados = await res.json();

  const select = document.getElementById("selectEmpleado");
  select.innerHTML = "";

  empleados.forEach(emp => {
    const option = document.createElement("option");
    option.value = emp.id;
    option.textContent = `${emp.nombre} (${emp.id})`;
    select.appendChild(option);
  });
}

// ===============================
//  CARGAR CATÁLOGO DE TAREAS
// ===============================

async function cargarCatalogo() {
  const res = await fetch("/api/catalogo");
  const catalogo = await res.json();

  const select = document.getElementById("selectTarea");
  select.innerHTML = "";

  catalogo.forEach(t => {
    const option = document.createElement("option");
    option.value = t.id;
    option.textContent = t.tarea;
    select.appendChild(option);
  });
}

// ===============================
//  CALENDARIO
// ===============================

function inicializarCalendario() {
  const calendario = document.getElementById("calendario");

  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();

  renderizarCalendario(año, mes);
}

function renderizarCalendario(año, mes) {
  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "";

  const primerDia = new Date(año, mes, 1).getDay();
  const diasMes = new Date(año, mes + 1, 0).getDate();

  let html = "<div class='grid-calendario'>";

  for (let i = 0; i < primerDia; i++) {
    html += "<div class='dia vacio'></div>";
  }

  for (let dia = 1; dia <= diasMes; dia++) {
    html += `<div class='dia' onclick="seleccionarDia(${año}, ${mes + 1}, ${dia})">${dia}</div>`;
  }

  html += "</div>";
  calendario.innerHTML = html;
}

// ===============================
//  SELECCIONAR DÍA
// ===============================

async function seleccionarDia(año, mes, dia) {
  const fecha = `${año}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  document.getElementById("fechaSeleccionada").textContent = fecha;

  const empleadoId = document.getElementById("selectEmpleado").value;

  await cargarTareasDelDia(empleadoId, fecha);
}

// ===============================
//  CARGAR TAREAS DEL DÍA
// ===============================

async function cargarTareasDelDia(empleadoId, fecha) {
  const res = await fetch(`/api/tareas-del-dia?empleadoId=${empleadoId}&fecha=${fecha}`);
  const tareas = await res.json();

  const contenedor = document.getElementById("listaTareasDia");
  contenedor.innerHTML = "";

  if (tareas.length === 0) {
    contenedor.innerHTML = "<p>No hay tareas asignadas para este día.</p>";
    return;
  }

  tareas.forEach(t => {
    const div = document.createElement("div");
    div.className = "tarea-item";
    div.innerHTML = `
      <strong>${t.tarea}</strong><br>
      Estado: ${t.estado}
    `;
    contenedor.appendChild(div);
  });
}

// ===============================
//  ASIGNAR NUEVA TAREA
// ===============================

async function asignarTarea() {
  const empleadoId = document.getElementById("selectEmpleado").value;
  const tareaId = document.getElementById("selectTarea").value;
  const fecha = document.getElementById("fechaSeleccionada").textContent;

  if (!fecha) {
    alert("Selecciona un día en el calendario.");
    return;
  }

  const body = { empleadoId, fecha, tareaId };

  await fetch("/api/admin/agregar-tarea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  alert("Tarea asignada correctamente.");

  await cargarTareasDelDia(empleadoId, fecha);
}
