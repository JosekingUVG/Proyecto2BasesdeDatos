import { randomUUID } from "crypto";
import { obtenerConexionPorUsuario, sequelizeAdmin } from "../config/db.js";
import { initModels } from "../models/index.js";

const sesiones = new Map();

export function inferirRol(usuario) {
	if (usuario.startsWith("admin_")) return "admin";
	if (usuario.startsWith("sub_")) return "subadmin";
	if (usuario.startsWith("vendedor_")) return "vendedor";
	if (usuario.startsWith("digitador_")) return "digitador";
	if (usuario.startsWith("auditor_")) return "auditor";
	return null;
}

export function obtenerSesion(token) {
	if (!token) return null;
	return sesiones.get(token) || null;
}

export async function loginService(usuario, contrasena) {
	if (!usuario || !contrasena) {
		return null;
	}

	const rol = inferirRol(usuario);
	if (!rol) {
		return null;
	}

	let sequelize;
	try {
		sequelize = obtenerConexionPorUsuario(usuario, contrasena);
		await sequelize.authenticate();
	} catch {
		return null;
	}

	const { Empleado } = initModels(sequelizeAdmin);
	const empleado = await Empleado.findOne({ where: { usuario } });

	if (!empleado) {
		await sequelize.close();
		return null;
	}

	const models = initModels(sequelize);
	const token = randomUUID();

	sesiones.set(token, {
		user: {
			id_empleado: empleado.id_empleado,
			nombre: empleado.nombre,
			usuario: empleado.usuario,
			rol,
		},
		sequelize,
		models,
	});

	return {
		message: "Login exitoso",
		token,
		user: {
			id_empleado: empleado.id_empleado,
			nombre: empleado.nombre,
			rol,
		},
	};
}

export async function logoutService(token) {
	const sesion = obtenerSesion(token);
	if (!sesion) {
		return false;
	}

	await sesion.sequelize.close();
	sesiones.delete(token);
	return true;
}
