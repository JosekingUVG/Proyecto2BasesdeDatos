import { Op } from "sequelize";

function validarNumero(valor, nombreCampo) {
	if (valor === undefined || valor === null || Number.isNaN(Number(valor))) {
		throw new Error(`Campo invalido: ${nombreCampo}`);
	}
}

export async function obtenerProductosService(models, filtros) {
	const { Producto, Proveedor } = models;
	const categoria = filtros.categoria || null;
	const search = filtros.search ? String(filtros.search).trim() : null;
	const precioMin =
		filtros.precio_min !== undefined && filtros.precio_min !== ""
			? Number(filtros.precio_min)
			: null;

	if (precioMin !== null && Number.isNaN(precioMin)) {
		throw new Error("precio_min debe ser numerico");
	}

	const where = {};
	if (categoria) where.categoria = categoria;
	if (precioMin !== null) where.precio = { [Op.gte]: precioMin };
	if (search) {
		where[Op.or] = [
			{ marca: { [Op.iLike]: `%${search}%` } },
			{ categoria: { [Op.iLike]: `%${search}%` } },
		];
	}

	const productos = await Producto.findAll({
		where,
		include: [{ model: Proveedor, as: "proveedor", attributes: ["nombre_proveedor"] }],
		order: [["id_producto", "ASC"]],
	});

	return productos.map((p) => {
		const json = p.toJSON();
		return {
			...json,
			nombre_proveedor: json.proveedor?.nombre_proveedor ?? null,
			proveedor: undefined,
		};
	});
}

export async function crearProductoService(models, data) {
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

	const idProducto = await models.procedimientos.gestionarProducto({
		id_producto: null,
		categoria: data.categoria,
		precio: Number(data.precio),
		marca: data.marca,
		id_proveedor: Number(data.id_proveedor),
		status_producto: "activo",
		cantidad: Number(data.cantidad),
		costo: Number(data.costo),
		accion: "CREAR",
	});

	const producto = await models.Producto.findByPk(idProducto, {
		include: [{ model: models.Proveedor, as: "proveedor", attributes: ["nombre_proveedor"] }],
	});

	return producto;
}

export async function actualizarProductoService(models, id, data) {
	const idProducto = Number(id);
	if (Number.isNaN(idProducto)) {
		throw new Error("ID de producto invalido");
	}

	const actual = await models.Producto.findByPk(idProducto);
	if (!actual) {
		return null;
	}

	const precio =
		data.precio !== undefined && data.precio !== "" ? Number(data.precio) : Number(actual.precio);
	if (Number.isNaN(precio)) {
		throw new Error("precio debe ser numerico");
	}

	await models.procedimientos.gestionarProducto({
		id_producto: idProducto,
		categoria: data.categoria ?? actual.categoria,
		precio,
		marca: data.marca ?? actual.marca,
		id_proveedor: data.id_proveedor ?? actual.id_proveedor,
		status_producto: data.status_producto ?? actual.status_producto,
		cantidad: data.cantidad ?? actual.cantidad,
		costo: data.costo ?? actual.costo,
		accion: "ACTUALIZAR",
	});

	return models.Producto.findByPk(idProducto);
}

export async function eliminarProductoService(models, id) {
	const idProducto = Number(id);
	if (Number.isNaN(idProducto)) {
		throw new Error("ID de producto invalido");
	}

	const actual = await models.Producto.findByPk(idProducto);
	if (!actual) {
		return null;
	}

	await models.procedimientos.cambiarStatusProducto(idProducto, "inactivo");
	return { id_producto: idProducto };
}

export async function actualizarInventarioInlineService(models, id, data) {
	const idProducto = Number(id);
	const cantidad = Number(data.cantidad);
	const precio = Number(data.precio);

	if (Number.isNaN(idProducto) || Number.isNaN(cantidad) || Number.isNaN(precio)) {
		throw new Error("cantidad y precio son requeridos y deben ser numericos");
	}

	if (cantidad < 0 || precio < 0) {
		throw new Error("cantidad y precio deben ser >= 0");
	}

	const actual = await models.Producto.findByPk(idProducto);
	if (!actual) {
		return null;
	}

	await models.procedimientos.actualizarInventarioInline(idProducto, cantidad, precio);
	return models.Producto.findByPk(idProducto);
}
