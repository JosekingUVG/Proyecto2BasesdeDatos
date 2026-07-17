export async function crearVentaService(models, data) {
	const idEmpleado = Number(data.id_empleado);
	const productos = data.productos;

	if (Number.isNaN(idEmpleado)) {
		throw new Error("id_empleado es requerido y debe ser numerico");
	}

	if (!Array.isArray(productos) || productos.length === 0) {
		throw new Error("productos debe ser un arreglo con al menos un item");
	}

	const ids = [];
	const cantidades = [];
	const precios = [];
	let totalVendido = 0;

	for (const item of productos) {
		const idProducto = Number(item.id_producto);
		const cantidad = Number(item.cantidad);

		if (Number.isNaN(idProducto) || Number.isNaN(cantidad) || cantidad <= 0) {
			throw new Error("Cada item debe incluir id_producto y cantidad > 0");
		}

		const producto = await models.Producto.findByPk(idProducto);
		if (!producto) {
			throw new Error(`Producto no encontrado: ${idProducto}`);
		}

		if (producto.status_producto !== "activo") {
			throw new Error(`Producto inactivo: ${idProducto}`);
		}

		if (producto.cantidad < cantidad) {
			throw new Error(`Stock insuficiente para producto: ${idProducto}`);
		}

		const precioUnitario = Number(producto.precio);
		ids.push(idProducto);
		cantidades.push(cantidad);
		precios.push(precioUnitario);
		totalVendido += precioUnitario * cantidad;
	}

	await models.procedimientos.registrarVenta(
		idEmpleado,
		totalVendido,
		ids,
		cantidades,
		precios,
	);

	const ultimaVenta = await models.Venta.findOne({
		where: { id_empleado: idEmpleado },
		order: [["id_venta", "DESC"]],
	});

	return {
		id_venta: ultimaVenta?.id_venta,
		total_vendido: totalVendido,
	};
}

export async function listarVentasService(models) {
	const ventas = await models.Venta.findAll({
		include: [
			{
				model: models.Empleado,
				as: "empleado",
				attributes: ["nombre"],
			},
		],
		order: [["id_venta", "DESC"]],
	});

	return ventas.map((v) => ({
		id_venta: v.id_venta,
		total_vendido: v.total_vendido,
		fecha_venta: v.fecha_venta,
		nombre_empleado: v.empleado?.nombre,
	}));
}

export async function obtenerVentaPorIdService(models, id) {
	const idVenta = Number(id);
	if (Number.isNaN(idVenta)) {
		throw new Error("ID de venta invalido");
	}

	const venta = await models.Venta.findByPk(idVenta, {
		include: [
			{
				model: models.Empleado,
				as: "empleado",
				attributes: ["nombre"],
			},
			{
				model: models.DetalleVenta,
				as: "detalles",
				include: [
					{
						model: models.Producto,
						as: "producto",
						attributes: ["marca"],
					},
				],
			},
		],
	});

	if (!venta) {
		return null;
	}

	return {
		venta: {
			id_venta: venta.id_venta,
			total_vendido: venta.total_vendido,
			fecha_venta: venta.fecha_venta,
			nombre_empleado: venta.empleado?.nombre,
		},
		detalle: venta.detalles.map((d) => ({
			id_producto: d.id_producto,
			marca: d.producto?.marca,
			cantidad_producto: d.cantidad_producto,
			precio_unitario: d.precio_unitario,
			subtotal: Number(d.cantidad_producto) * Number(d.precio_unitario),
		})),
	};
}
