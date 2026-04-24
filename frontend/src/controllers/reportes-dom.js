import {
  clearSession,
  readSession,
  renderSharedHeader,
  saveSession,
  showFeedback,
} from "../components/elementos-reutilizables.js";
import {
  logoutRequest,
  meRequest,
  reporteEmpleadosRequest,
  reporteFechasRequest,
  reporteProveedoresRequest,
} from "../services/consumo-api.js";

const shell = document.getElementById("app-shell");
const feedback = document.getElementById("reportes-feedback");

const tabFechas = document.getElementById("tab-r-fechas");
const tabProveedores = document.getElementById("tab-r-proveedores");
const tabEmpleados = document.getElementById("tab-r-empleados");

const panelFechas = document.getElementById("panel-r-fechas");
const panelProveedores = document.getElementById("panel-r-proveedores");
const panelEmpleados = document.getElementById("panel-r-empleados");

const fechaInicio = document.getElementById("fecha-inicio");
const fechaFin = document.getElementById("fecha-fin");
const btnFechas = document.getElementById("btn-r-fechas");
const tablaFechas = document.getElementById("tabla-r-fechas");
const resumenFechas = document.getElementById("resumen-fechas");

const btnProveedores = document.getElementById("btn-r-proveedores");
const tablaProveedores = document.getElementById("tabla-r-proveedores");
const resumenProveedores = document.getElementById("resumen-proveedores");

const mesEmpleado = document.getElementById("mes-empleado");
const btnEmpleados = document.getElementById("btn-r-empleados");
const tablaEmpleados = document.getElementById("tabla-r-empleados");
const resumenEmpleados = document.getElementById("resumen-empleados");

let sessionToken = "";

function formatCurrency(value) {
  return `Q ${Number(value || 0).toFixed(2)}`;
}

function redirectToLogin() {
  window.location.href = "/";
}

function bindHeaderActions() {
  const logoutButton = document.getElementById("header-logout");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", async () => {
    try {
      if (sessionToken) {
        await logoutRequest(sessionToken);
      }
    } catch {
      // No bloquea cierre local de sesion.
    } finally {
      clearSession();
      redirectToLogin();
    }
  });
}

function switchTab(tab) {
  const map = {
    fechas: [panelFechas, tabFechas],
    proveedores: [panelProveedores, tabProveedores],
    empleados: [panelEmpleados, tabEmpleados],
  };

  Object.entries(map).forEach(([key, value]) => {
    const isActive = key === tab;
    value[0].classList.toggle("hidden", !isActive);
    value[1].className = isActive ? "btn-secondary" : "btn-ghost";
  });
}

function setTable(tbody, htmlRows, colspan = 3) {
  tbody.innerHTML = htmlRows || `<tr><td colspan="${colspan}" class="empty-row">Sin datos</td></tr>`;
}

async function consultarFechas() {
  if (!fechaInicio.value || !fechaFin.value) {
    showFeedback(feedback, "Selecciona fecha inicio y fecha fin", true);
    return;
  }

  try {
    const result = await reporteFechasRequest(fechaInicio.value, fechaFin.value, sessionToken);

    resumenFechas.innerHTML = `
      <p>Total de ventas en el rango: <strong>${result.resumen.total_unidades}</strong></p>
      <p>Ganancia en el rango: <strong>${formatCurrency(result.resumen.total_ganancia)}</strong></p>
      <p>Ingresos en el rango: <strong>${formatCurrency(result.resumen.total_ingresos)}</strong></p>
    `;

    const rows = (result.detalle || [])
      .map(
        (item) => `
          <tr>
            <td>${String(item.fecha).slice(0, 10)}</td>
            <td>${item.total_unidades}</td>
            <td>${formatCurrency(item.total_ganancia)}</td>
          </tr>
        `,
      )
      .join("");

    setTable(tablaFechas, rows, 3);
    showFeedback(feedback, "Reporte por fechas cargado");
  } catch (error) {
    showFeedback(feedback, error.message || "No se pudo cargar el reporte", true);
  }
}

async function consultarProveedores() {
  try {
    const result = await reporteProveedoresRequest(sessionToken);

    resumenProveedores.innerHTML = `
      <p>Total ventas (todas): <strong>${result.resumen.total_unidades}</strong></p>
      <p>Numero de proveedores: <strong>${result.resumen.total_proveedores}</strong></p>
    `;

    const rows = (result.detalle || [])
      .map(
        (item) => `
          <tr>
            <td>${item.nombre_proveedor}</td>
            <td>${item.total_unidades}</td>
            <td>${String(item.mes).slice(0, 10)}</td>
          </tr>
        `,
      )
      .join("");

    setTable(tablaProveedores, rows, 3);
    showFeedback(feedback, "Reporte por proveedor cargado");
  } catch (error) {
    showFeedback(feedback, error.message || "No se pudo cargar el reporte", true);
  }
}

async function consultarEmpleados() {
  if (!mesEmpleado.value) {
    showFeedback(feedback, "Selecciona un mes para consultar", true);
    return;
  }

  try {
    const result = await reporteEmpleadosRequest(mesEmpleado.value, sessionToken);

    resumenEmpleados.innerHTML = `
      <p>Total de ventas atendidas: <strong>${result.resumen.total_ventas}</strong></p>
      <p>Total vendido: <strong>${formatCurrency(result.resumen.total_vendido)}</strong></p>
    `;

    const rows = (result.detalle || [])
      .map(
        (item) => `
          <tr>
            <td>${item.nombre}</td>
            <td>${item.numero_ventas}</td>
            <td>${formatCurrency(item.total_vendido)}</td>
          </tr>
        `,
      )
      .join("");

    setTable(tablaEmpleados, rows, 3);
    showFeedback(feedback, "Reporte por empleado cargado");
  } catch (error) {
    showFeedback(feedback, error.message || "No se pudo cargar el reporte", true);
  }
}

function bindEvents() {
  tabFechas.addEventListener("click", () => switchTab("fechas"));
  tabProveedores.addEventListener("click", () => switchTab("proveedores"));
  tabEmpleados.addEventListener("click", () => switchTab("empleados"));

  btnFechas.addEventListener("click", consultarFechas);
  btnProveedores.addEventListener("click", consultarProveedores);
  btnEmpleados.addEventListener("click", consultarEmpleados);
}

async function init() {
  const { token } = readSession();
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const me = await meRequest(token);
    sessionToken = token;
    saveSession(token, me);

    shell.innerHTML = renderSharedHeader({ active: "Reportes", userName: me.nombre });
    bindHeaderActions();
    bindEvents();

    const today = new Date().toISOString().slice(0, 10);
    fechaInicio.value = today;
    fechaFin.value = today;
    mesEmpleado.value = today;

    consultarFechas();
  } catch {
    clearSession();
    redirectToLogin();
  }
}

init();
