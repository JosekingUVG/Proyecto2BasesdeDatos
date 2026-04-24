import {
  clearSession,
  readSession,
  renderSharedHeader,
  saveSession,
  showFeedback,
} from "../components/elementos-reutilizables.js";
import {
  actualizarProductoRequest,
  actualizarStockRequest,
  crearProductoRequest,
  logoutRequest,
  meRequest,
} from "../services/consumo-api.js";

const shell = document.getElementById("app-shell");
const feedback = document.getElementById("producto-feedback");
const tabAgregar = document.getElementById("tab-agregar");
const tabActualizar = document.getElementById("tab-actualizar");
const panelAgregar = document.getElementById("panel-agregar");
const panelActualizar = document.getElementById("panel-actualizar");
const formAgregar = document.getElementById("form-agregar-producto");
const formActualizar = document.getElementById("form-actualizar-stock");

let sessionToken = "";

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
  const isAgregar = tab === "agregar";
  panelAgregar.classList.toggle("hidden", !isAgregar);
  panelActualizar.classList.toggle("hidden", isAgregar);
  tabAgregar.className = isAgregar ? "btn-secondary" : "btn-ghost";
  tabActualizar.className = isAgregar ? "btn-ghost" : "btn-secondary";
}

async function onAgregarProducto(event) {
  event.preventDefault();

  const data = new FormData(formAgregar);
  const payload = {
    categoria: String(data.get("categoria") || "").trim(),
    precio: Number(data.get("precio")),
    marca: String(data.get("marca") || "").trim(),
    id_proveedor: Number(data.get("id_proveedor")),
    cantidad: Number(data.get("cantidad")),
    costo: Number(data.get("costo")),
  };
  const status = String(data.get("status_producto") || "activo").toLowerCase();

  if (!payload.categoria || !payload.marca || Number.isNaN(payload.id_proveedor)) {
    showFeedback(feedback, "Completa los campos obligatorios", true);
    return;
  }

  try {
    const result = await crearProductoRequest(payload, sessionToken);

    if (status !== "activo") {
      await actualizarProductoRequest(result.producto.id_producto, { status_producto: status }, sessionToken);
    }

    showFeedback(feedback, "Producto creado correctamente");
    formAgregar.reset();
  } catch (error) {
    showFeedback(feedback, error.message || "No se pudo crear el producto", true);
  }
}

async function onActualizarStock(event) {
  event.preventDefault();

  const data = new FormData(formActualizar);
  const idProducto = Number(data.get("id_producto"));
  const cantidad = Number(data.get("cantidad"));
  const costoNuevo = Number(data.get("costo_nuevo"));

  if (Number.isNaN(idProducto) || Number.isNaN(cantidad) || Number.isNaN(costoNuevo)) {
    showFeedback(feedback, "Completa todos los campos con valores validos", true);
    return;
  }

  try {
    await actualizarStockRequest(
      idProducto,
      {
        cantidad,
        costo_nuevo: costoNuevo,
      },
      sessionToken,
    );

    showFeedback(feedback, "Stock actualizado correctamente");
    formActualizar.reset();
  } catch (error) {
    showFeedback(feedback, error.message || "No se pudo actualizar el stock", true);
  }
}

function bindEvents() {
  tabAgregar.addEventListener("click", () => switchTab("agregar"));
  tabActualizar.addEventListener("click", () => switchTab("actualizar"));
  formAgregar.addEventListener("submit", onAgregarProducto);
  formActualizar.addEventListener("submit", onActualizarStock);
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

    shell.innerHTML = renderSharedHeader({ active: "Producto", userName: me.nombre });
    bindHeaderActions();
    bindEvents();
  } catch {
    clearSession();
    redirectToLogin();
  }
}

init();
