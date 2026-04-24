import pool from "../config/db.js";

export async function verificarCredencialesModel(usuario, contrasena) {
	const query = `
		SELECT id_empleado, nombre, usuario
		FROM empleado
		WHERE usuario = $1
			AND contrasena = $2;
	`;
	const { rows } = await pool.query(query, [usuario, contrasena]);
	return rows[0] || null;
}

export async function obtenerProductosModel(categoria, precioMin, status, search) {
	const query = `
		SELECT
			p.id_producto,
			p.categoria,
			p.precio,
			p.marca,
			p.cantidad,
			p.status_producto,
			p.costo,
			p.id_proveedor,
			pr.nombre_proveedor
		FROM producto p
		JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
		WHERE ($1::text IS NULL OR p.categoria = $1)
			AND ($2::numeric IS NULL OR p.precio >= $2)
			AND ($3::text IS NULL OR LOWER(p.status_producto) = LOWER($3))
			AND (
				$4::text IS NULL
				OR p.marca ILIKE '%' || $4 || '%'
				OR p.categoria ILIKE '%' || $4 || '%'
			)
		ORDER BY p.id_producto;
	`;
	const { rows } = await pool.query(query, [categoria, precioMin, status, search]);
	return rows;
}

export async function crearProductoModel(data) {
	const query = `
		INSERT INTO producto (categoria, precio, marca, id_proveedor, cantidad, costo)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING *;
	`;
	const values = [
		data.categoria,
		data.precio,
		data.marca,
		data.id_proveedor,
		data.cantidad,
		data.costo,
	];

	const { rows } = await pool.query(query, values);
	return rows[0];
}

export async function actualizarProductoModel(idProducto, data) {
	const query = `
		UPDATE producto
		SET
			precio = COALESCE($1, precio),
			categoria = COALESCE($2, categoria),
			marca = COALESCE($3, marca),
			status_producto = COALESCE($4, status_producto)
		WHERE id_producto = $5
		RETURNING *;
	`;

	const values = [
		data.precio ?? null,
		data.categoria ?? null,
		data.marca ?? null,
		data.status_producto ?? null,
		idProducto,
	];

	const { rows } = await pool.query(query, values);
	return rows[0] || null;
}

export async function obtenerProductoPorIdModel(idProducto) {
	const query = `
		SELECT *
		FROM producto
		WHERE id_producto = $1;
	`;
	const { rows } = await pool.query(query, [idProducto]);
	return rows[0] || null;
}

export async function actualizarStockYCostoModel(idProducto, cantidad, costoNuevo) {
	const query = `
		UPDATE producto
		SET
			cantidad = cantidad + $1,
			costo = $2
		WHERE id_producto = $3
		RETURNING *;
	`;

	const { rows } = await pool.query(query, [cantidad, costoNuevo, idProducto]);
	return rows[0] || null;
}

export async function eliminarProductoModel(idProducto) {
	const query = `
		DELETE FROM producto
		WHERE id_producto = $1
		RETURNING id_producto;
	`;
	const { rows } = await pool.query(query, [idProducto]);
	return rows[0] || null;
}

export async function crearVentaTransaccionalModel(idEmpleado, productos) {
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const ventaResult = await client.query(
			`
				INSERT INTO venta (id_empleado, total_vendido)
				VALUES ($1, 0)
				RETURNING id_venta;
			`,
			[idEmpleado],
		);

		const idVenta = ventaResult.rows[0].id_venta;

		for (const item of productos) {
			const detalleInsert = await client.query(
				`
					INSERT INTO detalle_venta (id_venta, id_producto, cantidad_producto, precio_unitario)
					SELECT
						$1,
						p.id_producto,
						$2,
						p.precio
					FROM producto p
					WHERE p.id_producto = $3
						AND p.status_producto = 'activo'
						AND p.cantidad >= $2;
				`,
				[idVenta, item.cantidad, item.id_producto],
			);

			if (detalleInsert.rowCount === 0) {
				throw new Error(`Stock insuficiente o producto inactivo: ${item.id_producto}`);
			}

			const stockUpdate = await client.query(
				`
					UPDATE producto
					SET cantidad = cantidad - $1
					WHERE id_producto = $2
						AND cantidad >= $1;
				`,
				[item.cantidad, item.id_producto],
			);

			if (stockUpdate.rowCount === 0) {
				throw new Error(`No se pudo actualizar stock de producto: ${item.id_producto}`);
			}
		}

		const totalResult = await client.query(
			`
				SELECT COALESCE(SUM(cantidad_producto * precio_unitario), 0) AS total
				FROM detalle_venta
				WHERE id_venta = $1;
			`,
			[idVenta],
		);

		const totalVendido = Number(totalResult.rows[0].total);

		await client.query(
			`
				UPDATE venta
				SET total_vendido = $1
				WHERE id_venta = $2;
			`,
			[totalVendido, idVenta],
		);

		await client.query("COMMIT");
		return { id_venta: idVenta, total_vendido: totalVendido };
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
}

export async function listarVentasModel() {
	const query = `
		SELECT
			v.id_venta,
			v.total_vendido,
			v.fecha_venta,
			e.nombre AS nombre_empleado
		FROM venta v
		JOIN empleado e ON v.id_empleado = e.id_empleado
		ORDER BY v.id_venta DESC;
	`;
	const { rows } = await pool.query(query);
	return rows;
}

export async function obtenerVentaPorIdModel(idVenta) {
	const ventaQuery = `
		SELECT
			v.id_venta,
			v.total_vendido,
			v.fecha_venta,
			e.nombre AS nombre_empleado
		FROM venta v
		JOIN empleado e ON v.id_empleado = e.id_empleado
		WHERE v.id_venta = $1;
	`;

	const detalleQuery = `
		SELECT
			dv.id_producto,
			p.marca,
			dv.cantidad_producto,
			dv.precio_unitario,
			(dv.cantidad_producto * dv.precio_unitario) AS subtotal
		FROM detalle_venta dv
		JOIN producto p ON dv.id_producto = p.id_producto
		WHERE dv.id_venta = $1;
	`;

	const ventaResult = await pool.query(ventaQuery, [idVenta]);
	if (ventaResult.rowCount === 0) {
		return null;
	}

	const detalleResult = await pool.query(detalleQuery, [idVenta]);
	return {
		venta: ventaResult.rows[0],
		detalle: detalleResult.rows,
	};
}

export async function reporteFechasDetalleModel(fechaInicio, fechaFin) {
	const query = `
		SELECT
			DATE(v.fecha_venta) AS fecha,
			SUM(dv.cantidad_producto) AS total_unidades,
			SUM(dv.cantidad_producto * dv.precio_unitario) AS total_ingresos,
			SUM(dv.cantidad_producto * p.costo) AS total_costos,
			SUM(dv.cantidad_producto * dv.precio_unitario)
				- SUM(dv.cantidad_producto * p.costo) AS total_ganancia
		FROM venta v
		JOIN detalle_venta dv ON v.id_venta = dv.id_venta
		JOIN producto p ON dv.id_producto = p.id_producto
		WHERE v.fecha_venta BETWEEN $1 AND $2
		GROUP BY DATE(v.fecha_venta)
		ORDER BY fecha;
	`;

	const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
	return rows;
}

export async function reporteFechasResumenModel(fechaInicio, fechaFin) {
	const query = `
		SELECT
			COALESCE(SUM(dv.cantidad_producto), 0) AS total_unidades,
			COALESCE(SUM(dv.cantidad_producto * dv.precio_unitario), 0) AS total_ingresos,
			COALESCE(SUM(dv.cantidad_producto * p.costo), 0) AS total_costos,
			COALESCE(
				SUM(dv.cantidad_producto * dv.precio_unitario)
					- SUM(dv.cantidad_producto * p.costo),
				0
			) AS total_ganancia
		FROM venta v
		JOIN detalle_venta dv ON v.id_venta = dv.id_venta
		JOIN producto p ON dv.id_producto = p.id_producto
		WHERE v.fecha_venta BETWEEN $1 AND $2;
	`;

	const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
	return rows[0];
}

export async function reporteProveedoresDetalleModel() {
	const query = `
		SELECT
			pr.nombre_proveedor,
			DATE_TRUNC('month', v.fecha_venta) AS mes,
			SUM(dv.cantidad_producto) AS total_unidades
		FROM proveedor pr
		JOIN producto p ON pr.id_proveedor = p.id_proveedor
		JOIN detalle_venta dv ON p.id_producto = dv.id_producto
		JOIN venta v ON dv.id_venta = v.id_venta
		GROUP BY pr.nombre_proveedor, mes
		ORDER BY mes, pr.nombre_proveedor;
	`;

	const { rows } = await pool.query(query);
	return rows;
}

export async function reporteProveedoresResumenModel() {
	const query = `
		SELECT
			COALESCE(SUM(dv.cantidad_producto), 0) AS total_unidades,
			COUNT(DISTINCT pr.id_proveedor) AS total_proveedores
		FROM proveedor pr
		JOIN producto p ON pr.id_proveedor = p.id_proveedor
		JOIN detalle_venta dv ON p.id_producto = dv.id_producto;
	`;

	const { rows } = await pool.query(query);
	return rows[0];
}

export async function reporteEmpleadosDetalleModel(mes) {
	const query = `
		SELECT
			e.nombre,
			COUNT(v.id_venta) AS numero_ventas,
			SUM(v.total_vendido) AS total_vendido
		FROM empleado e
		JOIN venta v ON e.id_empleado = v.id_empleado
		WHERE DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', $1::date)
		GROUP BY e.nombre
		ORDER BY total_vendido DESC;
	`;

	const { rows } = await pool.query(query, [mes]);
	return rows;
}

export async function reporteEmpleadosResumenModel(mes) {
	const query = `
		SELECT
			COUNT(v.id_venta) AS total_ventas,
			COALESCE(SUM(v.total_vendido), 0) AS total_vendido
		FROM venta v
		WHERE DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', $1::date);
	`;

	const { rows } = await pool.query(query, [mes]);
	return rows[0];
}
