import {
	clearSession,
	readSession,
	saveSession,
	setLoading,
	showFeedback,
} from "../components/elementos-reutilizables.js";
import { loginRequest, logoutRequest, meRequest } from "../services/consumo-api.js";

const form = document.getElementById("login-form");
const feedback = document.getElementById("feedback");
const loginButton = document.getElementById("login-button");
const verifyButton = document.getElementById("verify-button");
const logoutButton = document.getElementById("logout-button");
const sessionPanel = document.getElementById("session-panel");
const sessionUser = document.getElementById("session-user");

function renderSessionState() {
	const { token, user } = readSession();
	if (token && user) {
		sessionPanel.classList.remove("hidden");
		sessionUser.textContent = `${user.nombre} (ID ${user.id_empleado})`;
	} else {
		sessionPanel.classList.add("hidden");
		sessionUser.textContent = "";
	}
}

async function validateAndRedirectIfAuthenticated() {
	const { token } = readSession();
	if (!token) return;

	try {
		const me = await meRequest(token);
		saveSession(token, me);
		window.location.href = "/inventario";
	} catch {
		clearSession();
		renderSessionState();
	}
}

async function onSubmitLogin(event) {
	event.preventDefault();

	const formData = new FormData(form);
	const usuario = String(formData.get("usuario") || "").trim();
	const contrasena = String(formData.get("contrasena") || "").trim();

	if (!usuario || !contrasena) {
		showFeedback(feedback, "Completa usuario y contrasena", true);
		return;
	}

	try {
		setLoading(loginButton, true);
		showFeedback(feedback, "Validando credenciales...");

		const result = await loginRequest(usuario, contrasena);
		const me = await meRequest(result.token);
		saveSession(result.token, me);
		showFeedback(feedback, `Sesion iniciada: ${me.nombre}`);
		window.location.href = "/inventario";
	} catch (error) {
		clearSession();
		renderSessionState();
		showFeedback(feedback, error.message || "No se pudo iniciar sesion", true);
	} finally {
		setLoading(loginButton, false);
	}
}

async function onVerifyToken() {
	const { token } = readSession();
	if (!token) {
		showFeedback(feedback, "No hay token activo", true);
		return;
	}

	try {
		showFeedback(feedback, "Verificando token...");
		const me = await meRequest(token);
		saveSession(token, me);
		renderSessionState();
		showFeedback(feedback, `Token valido para ${me.nombre}`);
	} catch (error) {
		clearSession();
		renderSessionState();
		showFeedback(feedback, error.message || "Token invalido", true);
	}
}

async function onLogout() {
	const { token } = readSession();
	try {
		if (token) {
			await logoutRequest(token);
		}
	} catch {
		// No bloquea limpieza local si falla backend.
	} finally {
		clearSession();
		renderSessionState();
		showFeedback(feedback, "Sesion cerrada correctamente");
	}
}

form.addEventListener("submit", onSubmitLogin);
verifyButton.addEventListener("click", onVerifyToken);
logoutButton.addEventListener("click", onLogout);

renderSessionState();
validateAndRedirectIfAuthenticated();
