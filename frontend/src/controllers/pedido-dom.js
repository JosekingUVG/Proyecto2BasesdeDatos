import {
  clearSession,
  readSession,
  renderSharedHeader,
  saveSession,
  showFeedback,
} from "../components/elementos-reutilizables.js";
import {
  crearVentaRequest,
  inventarioRequest,
  logoutRequest,
  meRequest,
} from "../services/consumo-api.js";

const CART_KEY = "pedido_cart";

const shell = document.getElementById("app-shell");
const feedback = document.getElementById("pedido-feedback");
const pedidoFecha = document.getElementById("pedido-fecha");
const pedidoCategoria = document.getElementById("pedido-categoria");
const pedidoPrecioMin = document.getElementById("pedido-precio-min");
const pedidoBuscar = document.getElementById("pedido-buscar");
const pedidoFiltrar = document.getElementById("pedido-filtrar");
const pedidoLimpiar = document.getElementById("pedido-limpiar");
const pedidoLista = document.getElementById("pedido-lista");
const pedidoResumen = document.getElementById("pedido-resumen");
const pedidoFinalizar = document.getElementById("pedido-finalizar");

const stepNuevo = document.getElementById("pedido-step-nuevo");
const stepConfirmar = document.getElementById("pedido-step-confirmar");
const stepRealizado = document.getElementById("pedido-step-realizado");

const confirmarFecha = document.getElementById("confirmar-fecha");
const confirmarTabla = document.getElementById("confirmar-tabla");
const confirmarTotal = document.getElementById("confirmar-total");
const confirmarVolver = document.getElementById("confirmar-volver");
const confirmarEnviar = document.getElementById("confirmar-enviar");

const realizadoFecha = document.getElementById("realizado-fecha");
const realizadoTabla = document.getElementById("realizado-tabla");
const realizadoTotal = document.getElementById("realizado-total");
const realizadoHome = document.getElementById("realizado-home");

let sessionToken = "";
let sessionUser = null;
let productosActivos = [];

function setCategoriaOptions(categorias) {
  const selectedValue = pedidoCategoria.value;
  const options = [
    '<option value="">Todas</option>',
    ...categorias.map((categoria) => `<option value="${categoria}">${categoria}</option>`),
  ];

  pedidoCategoria.innerHTML = options.join("");

  if (selectedValue && categorias.includes(selectedValue)) {
    pedidoCategoria.value = selectedValue;
  }
}

function formatCurrency(value) {
  return `Q ${Number(value || 0).toFixed(2)}`;
}

function formatFechaLarga(value) {
  const fecha = new Date(value);
  return fecha.toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function redirectToLogin() {
  window.location.href = "/";
}

function getCart() {
  const raw = sessionStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function resetCart() {
  sessionStorage.removeItem(CART_KEY);
}

function getFiltros() {
  return {
    categoria: pedidoCategoria.value,
    precio_min: pedidoPrecioMin.value,
    status: "activo",
    search: pedidoBuscar.value.trim(),
  };
}

function getNombreProducto(item) {
  return `${item.categoria || "Producto"} ${item.marca || ""}`.trim();
}

function updateCartSummary() {
  const cart = getCart();
  if (cart.length === 0) {
    pedidoResumen.textContent = "Carrito vacio";
    return;
  }

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.cantidad * Number(item.precio), 0);
  pedidoResumen.textContent = `Productos: ${totalItems} | Total parcial: ${formatCurrency(totalAmount)}`;
}

function renderListaProductos() {
  const data = productosActivos;

  if (data.length === 0) {
    pedidoLista.innerHTML = '<p class="empty-row">No hay productos activos con esos filtros.</p>';
    return;
  }

  const cart = getCart();
  pedidoLista.innerHTML = data
    .map((item) => {
      const inCart = cart.find((c) => c.id_producto === item.id_producto);
      const cantidad = inCart ? inCart.cantidad : 0;

      return `
        <article class="product-item">
          <div>
            <p class="product-name">${getNombreProducto(item)}</p>
            <p class="product-brand">${item.marca || "-"}</p>
          </div>
          <p class="product-price">${formatCurrency(item.precio)}</p>
          <div class="qty-control" data-id="${item.id_producto}">
            <button class="qty-btn js-restar" type="button">-</button>
            <span class="qty-value">${cantidad}</span>
            <button class="qty-btn js-sumar" type="button">+</button>
          </div>
          <button class="btn-secondary js-agregar" type="button" data-id="${item.id_producto}">Agregar</button>
        </article>
      `;
    })
    .join("");
}

function setStep(step) {
  stepNuevo.classList.toggle("hidden", step !== "nuevo");
  stepConfirmar.classList.toggle("hidden", step !== "confirmar");
  stepRealizado.classList.toggle("hidden", step !== "realizado");
}

function renderConfirmTable(tableTarget, cart) {
  if (cart.length === 0) {
    tableTarget.innerHTML = '<tr><td colspan="4" class="empty-row">No hay productos</td></tr>';
    return;
  }

  tableTarget.innerHTML = cart
    .map(
      (item) => `
        <tr>
          <td>${item.nombre}</td>
          <td>${item.cantidad}</td>
          <td>${formatCurrency(item.precio)}</td>
          <td>${formatCurrency(item.cantidad * Number(item.precio))}</td>
        </tr>
      `,
    )
    .join("");
}

function renderConfirmView() {
  const cart = getCart();
  const fechaValue = pedidoFecha.value || new Date().toISOString().slice(0, 10);
  const total = cart.reduce((acc, item) => acc + item.cantidad * Number(item.precio), 0);

  confirmarFecha.textContent = `Fecha del pedido: ${formatFechaLarga(fechaValue)}`;
  renderConfirmTable(confirmarTabla, cart);
  confirmarTotal.textContent = `Total Final: ${formatCurrency(total)}`;
}

function renderRealizadoView() {
  const cart = getCart();
  const fechaValue = pedidoFecha.value || new Date().toISOString().slice(0, 10);
  const total = cart.reduce((acc, item) => acc + item.cantidad * Number(item.precio), 0);

  realizadoFecha.textContent = `Fecha del pedido: ${formatFechaLarga(fechaValue)}`;
  renderConfirmTable(realizadoTabla, cart);
  realizadoTotal.textContent = `Total Final: ${formatCurrency(total)}`;
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
      // No bloquea limpieza local de sesion.
    } finally {
      clearSession();
      resetCart();
      redirectToLogin();
    }
  });
}

async function cargarProductos() {
  try {
    showFeedback(feedback, "Cargando productos...");
    const productos = await inventarioRequest(getFiltros(), sessionToken);

    productosActivos = productos;
    renderListaProductos();
    showFeedback(feedback, `Productos disponibles: ${productosActivos.length}`);
  } catch (error) {
    productosActivos = [];
    renderListaProductos();
    showFeedback(feedback, error.message || "No se pudo cargar productos", true);
  }
}

async function cargarCategoriasPedido() {
  const productos = await inventarioRequest({ status: "activo" }, sessionToken);
  const categorias = [...new Set(productos.map((item) => item.categoria).filter(Boolean))];
  setCategoriaOptions(categorias);
}

function handleCantidad(idProducto, delta) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id_producto === idProducto);

  if (index === -1) {
    if (delta > 0) {
      const product = productosActivos.find((p) => p.id_producto === idProducto);
      if (!product) return;
      cart.push({
        id_producto: product.id_producto,
        nombre: getNombreProducto(product),
        precio: Number(product.precio),
        cantidad: 1,
      });
    }
  } else {
    cart[index].cantidad = Math.max(0, cart[index].cantidad + delta);
    if (cart[index].cantidad === 0) {
      cart.splice(index, 1);
    }
  }

  setCart(cart);
  updateCartSummary();
  renderListaProductos();
}

function handleAgregar(idProducto) {
  const product = productosActivos.find((p) => p.id_producto === idProducto);
  if (!product) return;

  const cart = getCart();
  const index = cart.findIndex((item) => item.id_producto === idProducto);

  if (index === -1) {
    cart.push({
      id_producto: product.id_producto,
      nombre: getNombreProducto(product),
      precio: Number(product.precio),
      cantidad: 1,
    });
  } else {
    cart[index].cantidad += 1;
  }

  setCart(cart);
  updateCartSummary();
  renderListaProductos();
}

function bindListaEventos() {
  pedidoLista.addEventListener("click", (event) => {
    const minus = event.target.closest(".js-restar");
    if (minus) {
      const id = Number(minus.parentElement.dataset.id);
      handleCantidad(id, -1);
      return;
    }

    const plus = event.target.closest(".js-sumar");
    if (plus) {
      const id = Number(plus.parentElement.dataset.id);
      handleCantidad(id, 1);
      return;
    }

    const add = event.target.closest(".js-agregar");
    if (add) {
      const id = Number(add.dataset.id);
      handleAgregar(id);
    }
  });
}

async function confirmarPedido() {
  const cart = getCart();
  if (cart.length === 0) {
    showFeedback(feedback, "Debes agregar al menos un producto", true);
    setStep("nuevo");
    return;
  }

  try {
    const payload = {
      id_empleado: sessionUser.id_empleado,
      productos: cart.map((item) => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
      })),
    };

    await crearVentaRequest(payload, sessionToken);
    renderRealizadoView();
    setStep("realizado");
    showFeedback(feedback, "Pedido realizado correctamente");
    resetCart();
    updateCartSummary();
  } catch (error) {
    setStep("confirmar");
    showFeedback(feedback, error.message || "No se pudo registrar la venta", true);
  }
}

function bindGeneralEvents() {
  pedidoFiltrar.addEventListener("click", cargarProductos);
  pedidoBuscar.addEventListener("input", cargarProductos);

  pedidoLimpiar.addEventListener("click", () => {
    pedidoCategoria.value = "";
    pedidoPrecioMin.value = "";
    pedidoBuscar.value = "";
    cargarProductos();
  });

  pedidoFinalizar.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) {
      showFeedback(feedback, "Debes agregar al menos un producto", true);
      return;
    }
    renderConfirmView();
    setStep("confirmar");
  });

  confirmarVolver.addEventListener("click", () => setStep("nuevo"));
  confirmarEnviar.addEventListener("click", confirmarPedido);
  realizadoHome.addEventListener("click", () => {
    window.location.href = "/inventario";
  });
}

async function init() {
  const { token, user } = readSession();
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const me = await meRequest(token);
    sessionToken = token;
    sessionUser = me;
    saveSession(token, me);

    shell.innerHTML = renderSharedHeader({ active: "Nuevo Pedido", userName: me.nombre });
    bindHeaderActions();

    pedidoFecha.value = new Date().toISOString().slice(0, 10);

    updateCartSummary();
    bindListaEventos();
    bindGeneralEvents();
    await cargarCategoriasPedido();
    await cargarProductos();
  } catch {
    clearSession();
    resetCart();
    redirectToLogin();
  }
}

init();
