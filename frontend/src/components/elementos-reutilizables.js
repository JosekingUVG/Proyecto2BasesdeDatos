import {
	formatRolLabel,
	getInventoryPermissions,
	getNavItemsForRole,
} from "../services/roles.js";

const TOKEN_KEY = "session_token";
const USER_KEY = "session_user";

export function showFeedback(element, message, isError = false) {
	if (!element) return;
	element.textContent = message || "";
	element.classList.toggle("error", Boolean(isError));
}

export function setLoading(button, isLoading, label = "Entrar al sistema") {
	if (!button) return;
	button.disabled = isLoading;
	button.textContent = isLoading ? "Ingresando..." : label;
}

export function saveSession(token, user) {
	if (token) localStorage.setItem(TOKEN_KEY, token);
	if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function readSession() {
	const token = localStorage.getItem(TOKEN_KEY);
	const userRaw = localStorage.getItem(USER_KEY);
	const user = userRaw ? JSON.parse(userRaw) : null;
	return { token, user };
}

export function clearSession() {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}

export function renderSharedHeader({ active = "Inventario", userName = "", rol = "" } = {}) {
	const navItems = getNavItemsForRole(rol);
	const nav = navItems
		.map((item) => {
			const activeClass = item.label === active ? "nav-link active" : "nav-link";
			return `<a href="${item.href}" class="${activeClass}">${item.label}</a>`;
		})
		.join("");

	const rolTexto = rol ? formatRolLabel(rol) : "";

	return `
		<header class="app-header">
			<div class="brand-line">
				<p class="project-label">PROYECTO 2</p>
				<p class="project-user">${userName ? `Usuario: ${userName}` : "Usuario desconocido"}${rolTexto ? ` · ${rolTexto}` : ""}</p>
			</div>
			<button id="header-logout" type="button" class="btn-ghost header-logout">Cerrar sesion</button>
		</header>
		<nav class="app-nav" aria-label="Navegacion principal">
			${nav || '<span class="nav-empty">Sin modulos disponibles</span>'}
		</nav>
		<p class="session-chip">${userName ? `Sesion: ${userName}` : "Sesion activa"}</p>
	`;
}

function renderOptions(baseValues, selectedValue) {
	const allValues = [...baseValues];
	if (selectedValue && !allValues.includes(selectedValue)) {
		allValues.unshift(selectedValue);
	}

	return allValues
		.map((value) => {
			const selected = value === selectedValue ? "selected" : "";
			return `<option value="${value}" ${selected}>${value}</option>`;
		})
		.join("");
}

export function fillInventoryTable(
	tbody,
	productos = [],
	categoriasDisponibles = [],
	permissions = {},
) {
	if (!tbody) return;

	const {
		canEditCatalog = false,
		canEditInventario = false,
		showCosto = true,
	} = permissions;

	const categoriasBase =
		categoriasDisponibles.length > 0
			? categoriasDisponibles
			: [...new Set(productos.map((item) => item.categoria).filter(Boolean))];
	const statusBase = ["activo", "inactivo"];

	const colCount = 8 + (showCosto ? 1 : 0) + (canEditCatalog ? 1 : 0);

	if (productos.length === 0) {
		tbody.innerHTML = `
			<tr>
				<td colspan="${colCount}" class="empty-row">No hay productos para mostrar.</td>
			</tr>
		`;
		return;
	}

	tbody.innerHTML = productos
		.map((item) => {
			const nombre = `${item.categoria || "Producto"} ${item.marca || ""}`.trim();
			const statusActual = item.status_producto || "activo";
			const categoriaActual = item.categoria || "Accesorios";
			const cantidad = item.cantidad ?? 0;
			const precio = Number(item.precio || 0).toFixed(2);

			const cantidadCell = canEditInventario
				? `<input class="table-input js-cantidad" type="number" min="0" step="1" data-id="${item.id_producto}" value="${cantidad}" />`
				: `${cantidad}`;

			const precioCell = canEditInventario
				? `<input class="table-input js-precio" type="number" min="0" step="0.01" data-id="${item.id_producto}" value="${precio}" />`
				: `Q ${precio}`;

			const statusCell = canEditCatalog
				? `<select class="table-select js-status" data-id="${item.id_producto}">${renderOptions(statusBase, statusActual)}</select>`
				: statusActual;

			const categoriaCell = canEditCatalog
				? `<select class="table-select js-categoria" data-id="${item.id_producto}">${renderOptions(categoriasBase, categoriaActual)}</select>`
				: categoriaActual;

			const accionesCell = canEditCatalog
				? `<button class="table-action danger js-eliminar" type="button" data-id="${item.id_producto}">Eliminar</button>`
				: "-";

			const costoCell = showCosto
				? `<td>${item.costo != null ? `Q ${Number(item.costo).toFixed(2)}` : "-"}</td>`
				: "";

			return `
				<tr>
					<td>${item.id_producto}</td>
					<td>${nombre}</td>
					<td>${item.marca || "-"}</td>
					<td>${cantidadCell}</td>
					<td>${precioCell}</td>
					${costoCell}
					<td>${statusCell}</td>
					<td>${item.nombre_proveedor || "-"}</td>
					<td>${categoriaCell}</td>
					<td>${accionesCell}</td>
				</tr>
			`;
		})
		.join("");
}
