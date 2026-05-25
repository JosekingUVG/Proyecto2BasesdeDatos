import { extraerToken } from "../middleware/auth.middleware.js";
import {
	loginService,
	logoutService,
	obtenerSesion,
} from "../services/auth.services.js";

export async function loginController(req, res) {
	try {
		const { usuario, contrasena } = req.body;
		const resultado = await loginService(usuario, contrasena);

		if (!resultado) {
			return res.status(401).json({ message: "Credenciales invalidas" });
		}

		return res.status(200).json(resultado);
	} catch (error) {
		return res.status(500).json({ message: "Error en login", error: error.message });
	}
}

export async function meController(req, res) {
	const token = extraerToken(req);
	const sesion = obtenerSesion(token);

	if (!sesion) {
		return res.status(401).json({ message: "No autenticado" });
	}

	return res.status(200).json({
		id_empleado: sesion.user.id_empleado,
		nombre: sesion.user.nombre,
		rol: sesion.user.rol,
	});
}

export async function logoutController(req, res) {
	try {
		const token = extraerToken(req);
		await logoutService(token);
		return res.status(200).json({ message: "Logout exitoso" });
	} catch (error) {
		return res.status(500).json({ message: "Error en logout", error: error.message });
	}
}
