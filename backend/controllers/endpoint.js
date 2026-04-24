import {
	actualizarProductoService,
	actualizarStockService,
	crearProductoService,
	crearVentaService,
	eliminarProductoService,
	listarVentasService,
	loginService,
	logoutService,
	obtenerProductosService,
	obtenerUsuarioPorTokenService,
	obtenerVentaPorIdService,
	reporteEmpleadosService,
	reporteFechasService,
	reporteProveedoresService,
} from "../services/logica-negocio.js";

function extraerToken(req) {
	const bearer = req.headers.authorization || "";
	if (bearer.toLowerCase().startsWith("bearer ")) {
		return bearer.slice(7).trim();
	}
	return req.headers["x-session-token"] || null;
}

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
	const user = obtenerUsuarioPorTokenService(token);

	if (!user) {
		return res.status(401).json({ message: "No autenticado" });
	}

	return res.status(200).json({
		id_empleado: user.id_empleado,
		nombre: user.nombre,
	});
}

export async function logoutController(req, res) {
	const token = extraerToken(req);
	logoutService(token);
	return res.status(200).json({ message: "Logout exitoso" });
}

export async function getProductosController(req, res) {
	try {
		const productos = await obtenerProductosService(req.query);
		return res.status(200).json(productos);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function postProductoController(req, res) {
	try {
		const producto = await crearProductoService(req.body);
		return res.status(200).json({ message: "Producto creado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function putProductoController(req, res) {
	try {
		const producto = await actualizarProductoService(req.params.id, req.body);

		if (!producto) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({ message: "Producto actualizado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function putStockProductoController(req, res) {
	try {
		const { cantidad, costo_nuevo } = req.body;
		const producto = await actualizarStockService(req.params.id, cantidad, costo_nuevo);

		if (!producto) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res
			.status(200)
			.json({ message: "Stock actualizado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function deleteProductoController(req, res) {
	try {
		const eliminado = await eliminarProductoService(req.params.id);

		if (!eliminado) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({ message: "Producto eliminado correctamente" });
	} catch (error) {
		if (error.code === "23503") {
			return res
				.status(400)
				.json({ message: "No se puede eliminar (restriccion de clave foranea)" });
		}
		return res.status(500).json({ message: "Error al eliminar producto", error: error.message });
	}
}

export async function postVentaController(req, res) {
	try {
		const venta = await crearVentaService(req.body);
		return res.status(200).json(venta);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function getVentasController(req, res) {
	try {
		const ventas = await listarVentasService();
		return res.status(200).json(ventas);
	} catch (error) {
		return res.status(500).json({ message: "Error al listar ventas", error: error.message });
	}
}

export async function getVentaByIdController(req, res) {
	try {
		const venta = await obtenerVentaPorIdService(req.params.id);
		if (!venta) {
			return res.status(404).json({ message: "Venta no encontrada" });
		}
		return res.status(200).json(venta);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function getReporteFechasController(req, res) {
	try {
		const { fecha_inicio, fecha_fin } = req.query;
		const reporte = await reporteFechasService(fecha_inicio, fecha_fin);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function getReporteProveedoresController(req, res) {
	try {
		const reporte = await reporteProveedoresService();
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(500).json({ message: "Error en reporte", error: error.message });
	}
}

export async function getReporteEmpleadosController(req, res) {
	try {
		const { mes } = req.query;
		const reporte = await reporteEmpleadosService(mes);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}
