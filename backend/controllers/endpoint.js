/* 
 * Este archivo contiene los controladores para las rutas de la API.
 * Cada función maneja una ruta específica y se encarga de procesar la solicitud, interactuar con los servicios de lógica de negocio y enviar la respuesta adecuada.
 * Se utilizan funciones asíncronas para manejar operaciones que pueden tardar, como consultas a la base de datos.
 * Además, se incluye una función auxiliar para extraer el token de autenticación de las cabeceras de la solicitud.
 */

// Importamos los servicios de lógica de negocio que se encargan de la interacción con la base de datos y la lógica de la aplicación
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

// Función auxiliar para extraer el token de autenticación de las cabeceras de la solicitud
function extraerToken(req) {
	const bearer = req.headers.authorization || "";
	if (bearer.toLowerCase().startsWith("bearer ")) {
		return bearer.slice(7).trim();
	}
	return req.headers["x-session-token"] || null;
}

// Controladores para las rutas de la API
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

// Controlador para obtener información del usuario autenticado
export async function meController(req, res) {
	const token = extraerToken(req);
	const user = await obtenerUsuarioPorTokenService(token);

	if (!user) {
		return res.status(401).json({ message: "No autenticado" });
	}

	return res.status(200).json({
		id_empleado: user.id_empleado,
		nombre: user.nombre,
	});
}

// Controlador para manejar el logout del usuario, extrayendo el token de autenticación y llamando al servicio de logout para invalidar la sesión, luego devolviendo una respuesta indicando que el logout fue exitoso
export async function logoutController(req, res) {
	const token = extraerToken(req);
	logoutService(token);
	return res.status(200).json({ message: "Logout exitoso" });
}

// Controladores para manejar las operaciones relacionadas con los productos y las ventas, cada uno llamando al servicio correspondiente para realizar la lógica de negocio y devolviendo la respuesta adecuada según el resultado de la operación
export async function getProductosController(req, res) {
	try {
		const productos = await obtenerProductosService(req.query);
		return res.status(200).json(productos);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

// Función para crear un nuevo producto, validando que los campos requeridos estén presentes y sean del tipo correcto antes de llamar al servicio para crear el producto en la base de datos y devolver la respuesta con el resultado de la operación
export async function postProductoController(req, res) {
	try {
		const producto = await crearProductoService(req.body);
		return res.status(200).json({ message: "Producto creado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

// Función para actualizar la información de un producto existente, validando que el ID del producto sea un número válido y que los campos opcionales proporcionados sean correctos antes de llamar al servicio para actualizar el producto en la base de datos y devolver la respuesta con el resultado de la operación
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

// Función para actualizar el stock y el costo de un producto, validando que el ID del producto, la cantidad y el nuevo costo sean números válidos y que la cantidad sea mayor a cero antes de llamar al servicio para realizar la actualización en la base de datos y devolver la respuesta con el resultado de la operación
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

// Función para eliminar un producto, validando que el ID del producto sea un número válido antes de llamar al servicio para eliminar el producto de la base de datos y devolver la respuesta con el resultado de la operación, manejando específicamente el error de restricción de clave foránea para devolver un mensaje adecuado en caso de que el producto no pueda ser eliminado debido a relaciones existentes en la base de datos
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

// Función para crear una nueva venta, validando que el ID del empleado sea un número válido y que la lista de productos sea un arreglo con al menos un item, además de validar que cada item tenga un ID de producto y una cantidad válidos antes de llamar al servicio para realizar la transacción de venta en la base de datos y devolver la respuesta con el resultado de la operación
export async function postVentaController(req, res) {
	try {
		const venta = await crearVentaService(req.body);
		return res.status(200).json(venta);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

// Función para obtener la lista de ventas realizadas, devolviendo un arreglo con la información de cada venta, incluyendo el ID de la venta, el nombre del empleado que realizó la venta, la fecha de la venta y el total vendido, llamando al servicio correspondiente para obtener esta información de la base de datos y devolverla en la respuesta
export async function getVentasController(req, res) {
	try {
		const ventas = await listarVentasService();
		return res.status(200).json(ventas);
	} catch (error) {
		return res.status(500).json({ message: "Error al listar ventas", error: error.message });
	}
}

// Función para obtener la información de una venta específica por su ID, validando que el ID sea un número válido antes de llamar al servicio para consultar la venta en la base de datos y devolver su información detallada, incluyendo el resumen de la venta con el nombre del empleado, la fecha y el total vendido, así como el detalle con la lista de productos vendidos en esa venta
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

// Función para generar un reporte de ventas por fechas, validando que las fechas proporcionadas sean válidas antes de llamar al servicio para obtener el reporte de la base de datos y devolverlo en la respuesta, incluyendo tanto un resumen con el total vendido y el número de ventas realizadas en ese rango de fechas, como un detalle con la lista de ventas realizadas en ese período
export async function getReporteFechasController(req, res) {
	try {
		const { fecha_inicio, fecha_fin } = req.query;
		const reporte = await reporteFechasService(fecha_inicio, fecha_fin);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

// Función para generar un reporte de ventas por proveedor, devolviendo tanto un resumen con el total de unidades vendidas y el número de proveedores que realizaron ventas, como un detalle con el total de unidades vendidas por cada proveedor en cada mes, llamando al servicio correspondiente para obtener esta información de la base de datos y devolverla en la respuesta
export async function getReporteProveedoresController(req, res) {
	try {
		const reporte = await reporteProveedoresService();
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(500).json({ message: "Error en reporte", error: error.message });
	}
}

// Función para generar un reporte de ventas por empleado, devolviendo tanto un resumen con el total de ventas y el total vendido por cada empleado en un mes específico, como un detalle con el total vendido por cada empleado en cada mes, validando que el parámetro de mes sea proporcionado y sea válido antes de llamar al servicio para obtener esta información de la base de datos y devolverla en la respuesta
export async function getReporteEmpleadosController(req, res) {
	try {
		const { mes } = req.query;
		const reporte = await reporteEmpleadosService(mes);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}
