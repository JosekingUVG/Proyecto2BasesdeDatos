import {
	clearSession,
	readSession,
	renderSharedHeader,
	saveSession,
	showFeedback,
} from "../components/elementos-reutilizables.js";
import {
	actualizarProductoRequest,
	crearProductoRequest,
	logoutRequest,
	meRequest,
} from "../services/consumo-api.js";
import { assertPageAccess, getDefaultRoute } from "../services/roles.js";

const shell = document.getElementById("app-shell");
const feedback = document.getElementById("producto-feedback");
const formAgregar = document.getElementById("form-agregar-producto");
let sessionToken = "";
let sessionUser = null;

function redirectToLogin() {
	window.location.href = "/";
}

function redirectToDefault() {
	window.location.href = getDefaultRoute(sessionUser?.rol);
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

		if (status !== "activo" && result.producto?.id_producto) {
			await actualizarProductoRequest(
				result.producto.id_producto,
				{ status_producto: status },
				sessionToken,
			);
		}

		showFeedback(feedback, "Producto creado correctamente");
		formAgregar.reset();
	} catch (error) {
		showFeedback(feedback, error.message || "No se pudo crear el producto", true);
	}
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
		sessionUser = me;
		saveSession(token, me);

		if (!assertPageAccess(me.rol, window.location.pathname)) {
			redirectToDefault();
			return;
		}

		shell.innerHTML = renderSharedHeader({
			active: "Producto",
			userName: me.nombre,
			rol: me.rol,
		});
		bindHeaderActions();
		formAgregar.addEventListener("submit", onAgregarProducto);
	} catch {
		clearSession();
		redirectToLogin();
	}
}

init();
