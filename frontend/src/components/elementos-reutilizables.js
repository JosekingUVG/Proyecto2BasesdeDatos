const TOKEN_KEY = "session_token";
const USER_KEY = "session_user";

const NAV_ITEMS = [
	{ label: "Nuevo Pedido", href: "/nuevo-pedido" },
	{ label: "Producto", href: "/producto" },
	{ label: "Reportes", href: "/reportes" },
	{ label: "Inventario", href: "/inventario" },
];

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

export function renderSharedHeader({ active = "Inventario", userName = "" } = {}) {
	const nav = NAV_ITEMS.map((item) => {
		const activeClass = item.label === active ? "nav-link active" : "nav-link";
		return `<a href="${item.href}" class="${activeClass}">${item.label}</a>`;
	}).join("");

	return `
		<header class="app-header">
			<div class="brand-line">
				<p class="project-label">PROYECTO 2</p>
				<p class="project-user">${userName ? `Usuario: ${userName}` : "Usuario desconocido"}</p>
			</div>
			<button id="header-logout" type="button" class="btn-ghost header-logout">Cerrar sesion</button>
		</header>
		<nav class="app-nav" aria-label="Navegacion principal">
			${nav}
		</nav>
		<p class="session-chip">${userName ? `Sesion: ${userName}` : "Sesion activa"}</p>
	`;
}

export function fillInventoryTable(tbody, productos = []) {
	if (!tbody) return;

	const categoriasBase = ["Electrónica", "Muebles", "Accesorios"];
	const statusBase = ["activo", "inactivo"];

	const renderOptions = (baseValues, selectedValue) => {
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
	};

	if (productos.length === 0) {
		tbody.innerHTML = `
			<tr>
				<td colspan="9" class="empty-row">No hay productos para mostrar.</td>
			</tr>
		`;
		return;
	}

	tbody.innerHTML = productos
		.map((item) => {
			const nombre = `${item.categoria || "Producto"} ${item.marca || ""}`.trim();
			const statusActual = item.status_producto || "activo";
			const categoriaActual = item.categoria || "Accesorios";
			return `
				<tr>
					<td>${item.id_producto}</td>
					<td>${nombre}</td>
					<td>${item.marca || "-"}</td>
					<td>${item.cantidad ?? "-"}</td>
					<td>Q ${Number(item.precio || 0).toFixed(2)}</td>
					<td>
						<select class="table-select js-status" data-id="${item.id_producto}">
							${renderOptions(statusBase, statusActual)}
						</select>
					</td>
					<td>${item.nombre_proveedor || "-"}</td>
					<td>
						<select class="table-select js-categoria" data-id="${item.id_producto}">
							${renderOptions(categoriasBase, categoriaActual)}
						</select>
					</td>
					<td>
						<button class="table-action danger js-eliminar" type="button" data-id="${item.id_producto}">Eliminar</button>
					</td>
				</tr>
			`;
		})
		.join("");
}
