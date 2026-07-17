import { obtenerSesion } from "../services/auth.services.js";

export function extraerToken(req) {
	const bearer = req.headers.authorization || "";
	if (bearer.toLowerCase().startsWith("bearer ")) {
		return bearer.slice(7).trim();
	}
	return req.headers["x-session-token"] || null;
}

export async function requireAuth(req, res, next) {
	try {
		const token = extraerToken(req);
		const sesion = obtenerSesion(token);

		if (!sesion) {
			return res.status(401).json({ message: "No autenticado" });
		}

		req.token = token;
		req.user = sesion.user;
		req.sequelize = sesion.sequelize;
		req.models = sesion.models;
		next();
	} catch (error) {
		return res.status(500).json({ message: "Error de autenticacion", error: error.message });
	}
}
