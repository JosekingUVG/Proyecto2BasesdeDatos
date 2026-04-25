/*
 * logica-negocio.js
 * Este archivo contiene la lógica de negocio de la aplicación, incluyendo validaciones, reglas de negocio y coordinación entre los modelos y los controladores.
 * Aquí se implementan las funciones que realizan operaciones complejas o que requieren varias consultas a la base de datos.
 */

// Importamos las funciones de consulta SQL desde el archivo de modelos, que se encargan de interactuar directamente con la base de datos
import { randomUUID } from "crypto";

// Importamos las funciones de consulta SQL desde el archivo de modelos, que se encargan de interactuar directamente con la base de datos
import {
	actualizarProductoModel,
	actualizarStockYCostoModel,
	crearProductoModel,
	crearVentaTransaccionalModel,
	eliminarProductoModel,
	listarVentasModel,
	obtenerProductoPorIdModel,
	obtenerProductosModel,
	obtenerVentaPorIdModel,
	reporteEmpleadosDetalleModel,
	reporteEmpleadosResumenModel,
	reporteFechasDetalleModel,
	reporteFechasResumenModel,
	reporteProveedoresDetalleModel,
	reporteProveedoresResumenModel,
	verificarCredencialesModel,
} from "../models/consultas-sql.js";

// Mapa para almacenar las sesiones de los usuarios autenticados, donde la clave es el token de sesión y el valor es la información del usuario
const sesiones = new Map();

// Función auxiliar para validar que un valor es un número válido, lanzando un error si no lo es
function validarNumero(valor, nombreCampo) {
	if (valor === undefined || valor === null || Number.isNaN(Number(valor))) {
		throw new Error(`Campo invalido: ${nombreCampo}`);
	}
}

// Función para manejar el proceso de login, verificando las credenciales del usuario y generando un token de sesión si son válidas
export async function loginService(usuario, contrasena) {
	if (!usuario || !contrasena) {
		return null;
	}

	// Verificamos las credenciales del usuario utilizando el modelo correspondiente, que consulta la base de datos para validar el usuario y la contraseña
	const user = await verificarCredencialesModel(usuario, contrasena);
	if (!user) {
		return null;
	}

	// Si las credenciales son válidas, generamos un token de sesión único utilizando randomUUID y almacenamos la sesión en el mapa de sesiones	
	const token = randomUUID();
	sesiones.set(token, user);

	// Devolvemos el token de sesión y la información del usuario para que pueda ser utilizada en las respuestas de la API
	return {
		message: "Login exitoso",
		token,
		user: {
			id_empleado: user.id_empleado,
			nombre: user.nombre,
		},
	};
}

// Función para obtener la información del usuario autenticado a partir del token de sesión, devolviendo null si el token no es válido o no se encuentra en el mapa de sesiones
export function obtenerUsuarioPorTokenService(token) {
	if (!token) {
		return null;
	}
	return sesiones.get(token) || null;
}

// Función para manejar el proceso de logout, eliminando la sesión del usuario del mapa de sesiones utilizando el token proporcionado
export function logoutService(token) {
	if (!token) {
		return false;
	}
	return sesiones.delete(token);
}

// Función para obtener la lista de productos disponibles, aplicando filtros opcionales como categoría, precio mínimo, estado y búsqueda por marca o categoría
export async function obtenerProductosService(filtros) {
	const categoria = filtros.categoria || null;
	const status = filtros.status || null;
	const search = filtros.search ? String(filtros.search).trim() : null;
	const precioMin =
		filtros.precio_min !== undefined && filtros.precio_min !== ""
			? Number(filtros.precio_min)
			: null;

	if (precioMin !== null && Number.isNaN(precioMin)) {
		throw new Error("precio_min debe ser numerico");
	}

	return obtenerProductosModel(categoria, precioMin, status, search || null);
}

// Función para crear un nuevo producto, validando que se proporcionen todos los campos requeridos y que los valores numéricos sean válidos antes de llamar al modelo para insertar el producto en la base de datos
export async function crearProductoService(data) {
	const requeridos = [
		"categoria",
		"precio",
		"marca",
		"id_proveedor",
		"cantidad",
		"costo",
	];

	// Validamos que se proporcionen todos los campos requeridos y que no estén vacíos, lanzando un error si falta alguno de ellos
	for (const campo of requeridos) {
		if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
			throw new Error(`Campo requerido: ${campo}`);
		}
	}

	// Validamos que los campos numéricos sean válidos utilizando la función auxiliar validarNumero, lanzando un error si alguno de ellos no es un número válido	
	validarNumero(data.precio, "precio");
	validarNumero(data.id_proveedor, "id_proveedor");
	validarNumero(data.cantidad, "cantidad");
	validarNumero(data.costo, "costo");

	return crearProductoModel({
		categoria: data.categoria,
		precio: Number(data.precio),
		marca: data.marca,
		id_proveedor: Number(data.id_proveedor),
		cantidad: Number(data.cantidad),
		costo: Number(data.costo),
	});
}

// 	Función para actualizar la información de un producto existente, validando que el ID del producto sea un número válido y que los campos opcionales proporcionados sean correctos antes de llamar al modelo para actualizar el producto en la base de datos
export async function actualizarProductoService(id, data) {
	const idProducto = Number(id);
	if (Number.isNaN(idProducto)) {
		throw new Error("ID de producto invalido");
	}

	const payload = {
		precio:
			data.precio !== undefined && data.precio !== "" ? Number(data.precio) : undefined,
		categoria: data.categoria,
		marca: data.marca,
		status_producto: data.status_producto,
	};

	if (payload.precio !== undefined && Number.isNaN(payload.precio)) {
		throw new Error("precio debe ser numerico");
	}

	return actualizarProductoModel(idProducto, payload);
}

// Función para actualizar el stock y el costo de un producto, validando que el ID del producto, la cantidad y el nuevo costo sean números válidos y que la cantidad sea mayor a cero antes de llamar al modelo para realizar la actualización en la base de datos
export async function actualizarStockService(id, cantidad, costoNuevo) {
	const idProducto = Number(id);
	const cantidadNum = Number(cantidad);
	const costoNuevoNum = Number(costoNuevo);

	if (Number.isNaN(idProducto) || Number.isNaN(cantidadNum) || Number.isNaN(costoNuevoNum)) {
		throw new Error("Datos invalidos para actualizar stock");
	}

	if (cantidadNum <= 0 || costoNuevoNum < 0) {
		throw new Error("cantidad debe ser > 0 y costo_nuevo >= 0");
	}

	const productoActual = await obtenerProductoPorIdModel(idProducto);
	if (!productoActual) {
		return null;
	}

	const costoActual = Number(productoActual.costo);
	const costoPromedio = (costoActual + costoNuevoNum) / 2;

	return actualizarStockYCostoModel(idProducto, cantidadNum, costoPromedio);
}

// Función para eliminar un producto, validando que el ID del producto sea un número válido antes de llamar al modelo para eliminar el producto de la base de datos
export async function eliminarProductoService(id) {
	const idProducto = Number(id);
	if (Number.isNaN(idProducto)) {
		throw new Error("ID de producto invalido");
	}

	return eliminarProductoModel(idProducto);
}

// Función para crear una nueva venta, validando que el ID del empleado sea un número válido y que la lista de productos sea un arreglo con al menos un item, además de validar que cada item tenga un ID de producto y una cantidad válidos antes de llamar al modelo para realizar la transacción de venta en la base de datos
export async function crearVentaService(data) {
	const idEmpleado = Number(data.id_empleado);
	const productos = data.productos;

	if (Number.isNaN(idEmpleado)) {
		throw new Error("id_empleado es requerido y debe ser numerico");
	}

	if (!Array.isArray(productos) || productos.length === 0) {
		throw new Error("productos debe ser un arreglo con al menos un item");
	}

	const productosValidados = productos.map((item) => {
		const idProducto = Number(item.id_producto);
		const cantidad = Number(item.cantidad);

		if (Number.isNaN(idProducto) || Number.isNaN(cantidad) || cantidad <= 0) {
			throw new Error("Cada item debe incluir id_producto y cantidad > 0");
		}

		return {
			id_producto: idProducto,
			cantidad,
		};
	});

	return crearVentaTransaccionalModel(idEmpleado, productosValidados);
}

// Función para obtener la lista de ventas realizadas, devolviendo un arreglo con la información de cada venta, incluyendo el ID de la venta, el nombre del empleado que realizó la venta, la fecha de la venta y el total vendido
export async function listarVentasService() {
	return listarVentasModel();
}

// Función para obtener la información de una venta específica por su ID, validando que el ID sea un número válido antes de llamar al modelo para consultar la venta en la base de datos y devolver su información detallada
export async function obtenerVentaPorIdService(id) {
	const idVenta = Number(id);
	if (Number.isNaN(idVenta)) {
		throw new Error("ID de venta invalido");
	}

	return obtenerVentaPorIdModel(idVenta);
}

export async function reporteFechasService(fechaInicio, fechaFin) {
	if (!fechaInicio || !fechaFin) {
		throw new Error("fecha_inicio y fecha_fin son requeridos");
	}

	const [resumen, detalle] = await Promise.all([
		reporteFechasResumenModel(fechaInicio, fechaFin),
		reporteFechasDetalleModel(fechaInicio, fechaFin),
	]);

	return { resumen, detalle };
}

// Función para generar un reporte de ventas por proveedor, devolviendo tanto un resumen con el total de unidades vendidas y el número de proveedores que realizaron ventas, como un detalle con el total de unidades vendidas por cada proveedor en cada mes
export async function reporteProveedoresService() {
	const [resumen, detalle] = await Promise.all([
		reporteProveedoresResumenModel(),
		reporteProveedoresDetalleModel(),
	]);

	return { resumen, detalle };
}

// Función para generar un reporte de ventas por empleado, devolviendo tanto un resumen con el total de ventas y el total vendido por cada empleado en un mes específico, como un detalle con el total vendido por cada empleado en cada mes
export async function reporteEmpleadosService(mes) {
	if (!mes) {
		throw new Error("El parametro mes es requerido");
	}

	const [resumen, detalle] = await Promise.all([
		reporteEmpleadosResumenModel(mes),
		reporteEmpleadosDetalleModel(mes),
	]);

	return { resumen, detalle };
}
