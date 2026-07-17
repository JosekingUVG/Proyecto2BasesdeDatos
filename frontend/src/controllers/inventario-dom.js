import {
	clearSession,
	fillInventoryTable,
	readSession,
	renderSharedHeader,
	saveSession,
	showFeedback,
} from "../components/elementos-reutilizables.js";
import {
	actualizarInventarioRequest,
	actualizarProductoRequest,
	eliminarProductoRequest,
	inventarioRequest,
	logoutRequest,
	meRequest,
} from "../services/consumo-api.js";
import {
	assertPageAccess,
	getDefaultRoute,
	getInventoryPermissions,
} from "../services/roles.js";

const shell = document.getElementById("app-shell");
const tbody = document.getElementById("tabla-inventario-body");
const theadRow = document.getElementById("tabla-inventario-head");
const feedback = document.getElementById("inventory-feedback");
const categoriaSelect = document.getElementById("filtro-categoria");
const precioInput = document.getElementById("filtro-precio");
const filtrarBtn = document.getElementById("btn-filtrar");

let sessionToken = "";
let sessionUser = null;
let inventoryPermissions = getInventoryPermissions(null);
let categoriasDisponibles = [];

function redirectToLogin() {
	window.location.href = "/";
}

function redirectToDefault() {
	window.location.href = getDefaultRoute(sessionUser?.rol);
}

function renderTableHead() {
	const { showCosto, canEditCatalog } = inventoryPermissions;
	const headers = [
		"ID",
		"Nombre",
		"Marca",
		"Cantidad",
		"Precio",
		...(showCosto ? ["Costo"] : []),
		"Status",
		"Proveedor",
		"Categoria",
		...(canEditCatalog ? ["Acciones"] : []),
	];

	theadRow.innerHTML = headers.map((h) => `<th>${h}</th>`).join("");
}

function getFiltrosActuales() {
	return {
		categoria: categoriaSelect.value,
		precio_min: precioInput.value,
	};
}

function setCategoriaOptions(selectElement, categorias) {
	const selectedValue = selectElement.value;
	const options = [
		'<option value="">Todas</option>',
		...categorias.map((categoria) => `<option value="${categoria}">${categoria}</option>`),
	];

	selectElement.innerHTML = options.join("");

	if (selectedValue && categorias.includes(selectedValue)) {
		selectElement.value = selectedValue;
	}
}

async function cargarCategoriasInventario() {
	const productos = await inventarioRequest({}, sessionToken);
	categoriasDisponibles = [...new Set(productos.map((item) => item.categoria).filter(Boolean))];
	setCategoriaOptions(categoriaSelect, categoriasDisponibles);
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

async function cargarInventario() {
	try {
		showFeedback(feedback, "Cargando inventario...");
		filtrarBtn.disabled = true;

		const productos = await inventarioRequest(getFiltrosActuales(), sessionToken);

		fillInventoryTable(tbody, productos, categoriasDisponibles, inventoryPermissions);
		showFeedback(feedback, `Registros cargados: ${productos.length}`);
	} catch (error) {
		fillInventoryTable(tbody, [], categoriasDisponibles, inventoryPermissions);
		showFeedback(feedback, error.message || "No se pudo cargar inventario", true);
	} finally {
		filtrarBtn.disabled = false;
	}
}

async function onDeleteProducto(idProducto) {
	try {
		showFeedback(feedback, "Eliminando producto...");
		await eliminarProductoRequest(idProducto, sessionToken);
		await cargarCategoriasInventario();
		showFeedback(feedback, "Producto dado de baja correctamente");
		await cargarInventario();
	} catch (error) {
		showFeedback(feedback, error.message || "No se pudo eliminar el producto", true);
	}
}

async function onEditarCampo(idProducto, payload) {
	try {
		showFeedback(feedback, "Actualizando producto...");
		await actualizarProductoRequest(idProducto, payload, sessionToken);
		await cargarCategoriasInventario();
		showFeedback(feedback, "Producto actualizado correctamente");
		await cargarInventario();
	} catch (error) {
		showFeedback(feedback, error.message || "No se pudo actualizar el producto", true);
	}
}

async function onActualizarInventarioInline(idProducto, cantidad, precio) {
	try {
		showFeedback(feedback, "Actualizando inventario...");
		await actualizarInventarioRequest(
			idProducto,
			{ cantidad: Number(cantidad), precio: Number(precio) },
			sessionToken,
		);
		showFeedback(feedback, "Cantidad y precio actualizados");
		await cargarInventario();
	} catch (error) {
		showFeedback(feedback, error.message || "No se pudo actualizar inventario", true);
		await cargarInventario();
	}
}

function bindTableActions() {
	if (inventoryPermissions.canEditCatalog) {
		tbody.addEventListener("click", async (event) => {
			const button = event.target.closest(".js-eliminar");
			if (!button) return;

			const idProducto = Number(button.dataset.id);
			if (Number.isNaN(idProducto)) return;

			await onDeleteProducto(idProducto);
		});

		tbody.addEventListener("change", async (event) => {
			const statusSelect = event.target.closest(".js-status");
			if (statusSelect) {
				const idProducto = Number(statusSelect.dataset.id);
				if (!Number.isNaN(idProducto)) {
					await onEditarCampo(idProducto, { status_producto: statusSelect.value });
				}
				return;
			}

			const categoriaSelectRow = event.target.closest(".js-categoria");
			if (categoriaSelectRow) {
				const idProducto = Number(categoriaSelectRow.dataset.id);
				if (!Number.isNaN(idProducto)) {
					await onEditarCampo(idProducto, { categoria: categoriaSelectRow.value });
				}
			}
		});
	}

	if (inventoryPermissions.canEditInventario) {
		tbody.addEventListener("change", async (event) => {
			const cantidadInput = event.target.closest(".js-cantidad");
			const precioInput = event.target.closest(".js-precio");

			if (!cantidadInput && !precioInput) return;

			const row = event.target.closest("tr");
			const cantidadEl = row?.querySelector(".js-cantidad");
			const precioEl = row?.querySelector(".js-precio");
			if (!cantidadEl || !precioEl) return;

			const idProducto = Number(cantidadEl.dataset.id);
			if (Number.isNaN(idProducto)) return;

			await onActualizarInventarioInline(
				idProducto,
				cantidadEl.value,
				precioEl.value,
			);
		});
	}
}

async function initInventario() {
	const { token } = readSession();
	if (!token) {
		redirectToLogin();
		return;
	}

	try {
		const me = await meRequest(token);
		sessionToken = token;
		sessionUser = me;
		saveSession(token, me);

		if (!assertPageAccess(me.rol, window.location.pathname)) {
			redirectToDefault();
			return;
		}

		inventoryPermissions = getInventoryPermissions(me.rol);
		renderTableHead();

		shell.innerHTML = renderSharedHeader({
			active: "Inventario",
			userName: me.nombre,
			rol: me.rol,
		});
		bindHeaderActions();

		await cargarCategoriasInventario();
		await cargarInventario();
	} catch {
		clearSession();
		redirectToLogin();
	}
}

filtrarBtn.addEventListener("click", cargarInventario);
bindTableActions();

initInventario();
