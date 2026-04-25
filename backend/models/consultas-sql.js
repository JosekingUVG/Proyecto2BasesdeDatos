/*
 * Este archivo contiene todas las consultas SQL necesarias para la aplicación.
 * Cada función representa una consulta específica que interactúa con la base de datos.
 * Se utiliza el pool de conexiones para ejecutar las consultas de manera eficiente.
 * Las funciones son asíncronas y devuelven los resultados de las consultas o null si no se encuentran datos.
*/

// Importamos el pool de conexiones a la base de datos
import pool from "../config/db.js";

// Función para verificar las credenciales de un usuario durante el login
export async function verificarCredencialesModel(usuario, contrasena) {
	const query = `
		SELECT id_empleado, nombre, usuario
		FROM empleado
		WHERE usuario = $1
			AND contrasena = $2;
	`;

	// Ejecutamos la consulta con los parámetros proporcionados y devolvemos el resultado
	const { rows } = await pool.query(query, [usuario, contrasena]);
	return rows[0] || null;
}

// Función para obtener la información de un producto con un join de proveedor para usar en el inventario
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

	// Ejecutamos la consulta con los parámetros proporcionados y devolvemos los resultados
	const { rows } = await pool.query(query, [categoria, precioMin, status, search]);
	return rows;
}

// Función para crear un nuevo producto en la base de datos
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

	// Ejecutamos la consulta con los parámetros proporcionados y devolvemos el resultado
	const { rows } = await pool.query(query, values);
	return rows[0];
}

// Función para actualizar la información de un producto existente en la base de datos
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

	// Ejecutamos la consulta con los parámetros proporcionados y devolvemos el resultado
	const { rows } = await pool.query(query, values);
	return rows[0] || null;
}

// Función para obtener la información de un producto por su ID
export async function obtenerProductoPorIdModel(idProducto) {
	const query = `
		SELECT *
		FROM producto
		WHERE id_producto = $1;
	`;
	const { rows } = await pool.query(query, [idProducto]);
	return rows[0] || null;
}

// Función para actualizar el stock y el costo de un producto existente en la base de datos
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

// Función para eliminar un producto de la base de datos por su ID
export async function eliminarProductoModel(idProducto) {
	const query = `
		DELETE FROM producto
		WHERE id_producto = $1
		RETURNING id_producto;
	`;
	const { rows } = await pool.query(query, [idProducto]);
	return rows[0] || null;
}

//  Función para crear una nueva venta de manera transaccional, asegurando la integridad de los datos en caso de errores
export async function crearVentaTransaccionalModel(idEmpleado, productos) {
	const client = await pool.connect();

	try {
		// Iniciamos la transacción
		await client.query("BEGIN");

		// Insertamos la venta y obtenemos su ID para usarlo en los detalles de la venta
		const ventaResult = await client.query(
			`
				INSERT INTO venta (id_empleado, total_vendido)
				VALUES ($1, 0)
				RETURNING id_venta;
			`,
			[idEmpleado],
		);

		// Obtenemos el ID de la venta recién creada para usarlo en los detalles de la venta
		const idVenta = ventaResult.rows[0].id_venta;

		// Iteramos sobre los productos vendidos para insertar los detalles de la venta y actualizar el stock de cada producto
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

			// Si no se pudo insertar el detalle de la venta, significa que el producto no tiene suficiente stock o está inactivo, por lo que lanzamos un error para hacer rollback de la transacción
			if (detalleInsert.rowCount === 0) {
				throw new Error(`Stock insuficiente o producto inactivo: ${item.id_producto}`);
			}

			// Actualizamos el stock del producto restando la cantidad vendida
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
				// Si no se pudo actualizar el stock, significa que el producto no tiene suficiente stock, por lo que lanzamos un error para hacer rollback de la transacción
				throw new Error(`No se pudo actualizar stock de producto: ${item.id_producto}`);
			}
		}

		// Calculamos el total vendido sumando el subtotal de cada detalle de la venta y actualizamos la venta con el total calculado
		const totalResult = await client.query(
			`
				SELECT COALESCE(SUM(cantidad_producto * precio_unitario), 0) AS total
				FROM detalle_venta
				WHERE id_venta = $1;
			`,
			[idVenta],
		);

		// Obtenemos el total vendido calculado y actualizamos la venta con este valor
		const totalVendido = Number(totalResult.rows[0].total);

		// Actualizamos la venta con el total vendido calculado
		await client.query(
			`
				UPDATE venta
				SET total_vendido = $1
				WHERE id_venta = $2;
			`,
			[totalVendido, idVenta],
		);

		// Si todo se ejecutó correctamente, hacemos commit de la transacción para guardar los cambios en la base de datos
		await client.query("COMMIT");
		return { id_venta: idVenta, total_vendido: totalVendido };
		// Si ocurre algún error durante el proceso, hacemos rollback de la transacción para revertir cualquier cambio realizado y lanzamos el error para que sea manejado por el controlador
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
		// Finalmente, liberamos el cliente de la conexión para que pueda ser reutilizado por otras consultas
	} finally {
		client.release();
	}
}

// Función para listar todas las ventas realizadas, incluyendo información del empleado que realizó cada venta
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
	// Ejecutamos la consulta y devolvemos los resultados
	const { rows } = await pool.query(query);
	return rows;
}

// Función para obtener la información de una venta por su ID, incluyendo los detalles de los productos vendidos en esa venta
export async function obtenerVentaPorIdModel(idVenta) {

	// Consulta para obtener la información general de la venta, incluyendo el total vendido, fecha de la venta y nombre del empleado que realizó la venta
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

	// Consulta para obtener los detalles de los productos vendidos en la venta, incluyendo el nombre del producto, cantidad, precio unitario y subtotal
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

	// Ejecutamos ambas consultas de manera secuencial para obtener la información de la venta y sus detalles
	const ventaResult = await pool.query(ventaQuery, [idVenta]);
	if (ventaResult.rowCount === 0) {
		return null;
	}

	// Si la venta existe, ejecutamos la consulta para obtener los detalles de la venta y devolvemos un objeto con la información de la venta y sus detalles
	const detalleResult = await pool.query(detalleQuery, [idVenta]);
	return {
		venta: ventaResult.rows[0],
		detalle: detalleResult.rows,
	};
}

// Función para generar un reporte detallado de ventas entre dos fechas
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

	// Ejecutamos la consulta con los parámetros proporcionados y devolvemos los resultados
	const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
	return rows;
}

// Función para generar un reporte resumen de ventas entre dos fechas, incluyendo totales de unidades vendidas, ingresos, costos y ganancias
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

	// Ejecutamos la consulta con los parámetros proporcionados y devolvemos el resultado
	const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
	return rows[0];
}

// Función para generar un reporte detallado de ventas por proveedor, mostrando el total de unidades vendidas por cada proveedor en cada mes
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

	// Ejecutamos la consulta y devolvemos los resultados
	const { rows } = await pool.query(query);
	return rows;
}

// Función para generar un reporte resumen de ventas por proveedor, mostrando el total de unidades vendidas y el número de proveedores que realizaron ventas
export async function reporteProveedoresResumenModel() {
	const query = `
		SELECT
			COALESCE(SUM(dv.cantidad_producto), 0) AS total_unidades,
			COUNT(DISTINCT pr.id_proveedor) AS total_proveedores
		FROM proveedor pr
		JOIN producto p ON pr.id_proveedor = p.id_proveedor
		JOIN detalle_venta dv ON p.id_producto = dv.id_producto;
	`;

	// Ejecutamos la consulta y devolvemos el resultado
	const { rows } = await pool.query(query);
	return rows[0];
}

// Función para generar un reporte detallado de ventas por empleado, mostrando el total vendido por cada empleado en un mes específico
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

// Función para generar un reporte resumen de ventas por empleado, mostrando el total de ventas y el total vendido en un mes específico
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
