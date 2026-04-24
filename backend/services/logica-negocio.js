import { randomUUID } from "crypto";
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

const sesiones = new Map();

function validarNumero(valor, nombreCampo) {
	if (valor === undefined || valor === null || Number.isNaN(Number(valor))) {
		throw new Error(`Campo invalido: ${nombreCampo}`);
	}
}

export async function loginService(usuario, contrasena) {
	if (!usuario || !contrasena) {
		return null;
	}

	const user = await verificarCredencialesModel(usuario, contrasena);
	if (!user) {
		return null;
	}

	const token = randomUUID();
	sesiones.set(token, user);

	return {
		message: "Login exitoso",
		token,
		user: {
			id_empleado: user.id_empleado,
			nombre: user.nombre,
		},
	};
}

export function obtenerUsuarioPorTokenService(token) {
	if (!token) {
		return null;
	}
	return sesiones.get(token) || null;
}

export function logoutService(token) {
	if (!token) {
		return false;
	}
	return sesiones.delete(token);
}

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

export async function crearProductoService(data) {
	const requeridos = [
		"categoria",
		"precio",
		"marca",
		"id_proveedor",
		"cantidad",
		"costo",
	];

	for (const campo of requeridos) {
		if (data[campo] === undefined || data[campo] === null || data[campo] === "") {
			throw new Error(`Campo requerido: ${campo}`);
		}
	}

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

export async function eliminarProductoService(id) {
	const idProducto = Number(id);
	if (Number.isNaN(idProducto)) {
		throw new Error("ID de producto invalido");
	}

	return eliminarProductoModel(idProducto);
}

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

export async function listarVentasService() {
	return listarVentasModel();
}

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

export async function reporteProveedoresService() {
	const [resumen, detalle] = await Promise.all([
		reporteProveedoresResumenModel(),
		reporteProveedoresDetalleModel(),
	]);

	return { resumen, detalle };
}

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
