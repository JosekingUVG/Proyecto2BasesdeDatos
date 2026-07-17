import { QueryTypes } from "sequelize";

export function initProcedimientos(sequelize) {
	async function registrarVenta(idEmpleado, totalVendido, ids, cantidades, precios) {
		await sequelize.query(
			`CALL sp_registrar_venta($1, $2, $3::int[], $4::int[], $5::numeric[])`,
			{ bind: [idEmpleado, totalVendido, ids, cantidades, precios] },
		);
	}

	async function gestionarProducto(params) {
		const [rows] = await sequelize.query(
			`CALL sp_gestionar_producto($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			{
				bind: [
					params.id_producto,
					params.categoria,
					params.precio,
					params.marca,
					params.id_proveedor,
					params.status_producto,
					params.cantidad,
					params.costo,
					params.accion,
				],
			},
		);

		const fila = rows?.[0];
		if (fila?.p_id_producto != null) {
			return Number(fila.p_id_producto);
		}
		return params.id_producto;
	}

	async function cambiarStatusProducto(idProducto, nuevoStatus) {
		await sequelize.query(`CALL sp_cambiar_status_producto($1, $2)`, {
			bind: [idProducto, nuevoStatus],
		});
	}

	async function obtenerResumenProveedores() {
		const [rows] = await sequelize.query(
			`CALL sp_obtener_resumen_proveedores(NULL::bigint, NULL::bigint)`,
		);
		const fila = rows?.[0] ?? {};
		return {
			total_unidades: Number(fila.p_total_unidades ?? 0),
			total_proveedores: Number(fila.p_total_proveedores ?? 0),
		};
	}

	async function actualizarInventarioInline(idProducto, cantidad, precio) {
		await sequelize.query(`CALL sp_actualizar_inventario_inline($1, $2, $3)`, {
			bind: [idProducto, cantidad, precio],
		});
	}

	async function reporteFechasDetalle(fechaInicio, fechaFin) {
		return sequelize.query(
			`
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
				WHERE v.fecha_venta::date BETWEEN :fecha_inicio::date AND :fecha_fin::date
				GROUP BY DATE(v.fecha_venta)
				ORDER BY fecha
			`,
			{
				replacements: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
				type: QueryTypes.SELECT,
			},
		);
	}

	async function reporteFechasResumen(fechaInicio, fechaFin) {
		const [fila] = await sequelize.query(
			`
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
				WHERE v.fecha_venta::date BETWEEN :fecha_inicio::date AND :fecha_fin::date
			`,
			{
				replacements: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
				type: QueryTypes.SELECT,
			},
		);
		return fila;
	}

	async function reporteProveedoresDetalle() {
		return sequelize.query(
			`
				SELECT
					pr.nombre_proveedor,
					DATE_TRUNC('month', v.fecha_venta) AS mes,
					SUM(dv.cantidad_producto) AS total_unidades
				FROM proveedor pr
				JOIN producto p ON pr.id_proveedor = p.id_proveedor
				JOIN detalle_venta dv ON p.id_producto = dv.id_producto
				JOIN venta v ON dv.id_venta = v.id_venta
				GROUP BY pr.nombre_proveedor, mes
				ORDER BY mes, pr.nombre_proveedor
			`,
			{ type: QueryTypes.SELECT },
		);
	}

	async function reporteEmpleadosDetalle(mes) {
		return sequelize.query(
			`
				SELECT
					e.nombre,
					COUNT(v.id_venta) AS numero_ventas,
					SUM(v.total_vendido) AS total_vendido
				FROM empleado e
				JOIN venta v ON e.id_empleado = v.id_empleado
				WHERE DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', :mes::date)
				GROUP BY e.nombre
				ORDER BY total_vendido DESC
			`,
			{ replacements: { mes }, type: QueryTypes.SELECT },
		);
	}

	async function reporteEmpleadosResumen(mes) {
		const [fila] = await sequelize.query(
			`
				SELECT
					COUNT(v.id_venta) AS total_ventas,
					COALESCE(SUM(v.total_vendido), 0) AS total_vendido
				FROM venta v
				WHERE DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', :mes::date)
			`,
			{ replacements: { mes }, type: QueryTypes.SELECT },
		);
		return fila;
	}

	return {
		registrarVenta,
		gestionarProducto,
		cambiarStatusProducto,
		obtenerResumenProveedores,
		actualizarInventarioInline,
		reporteFechasDetalle,
		reporteFechasResumen,
		reporteProveedoresDetalle,
		reporteEmpleadosDetalle,
		reporteEmpleadosResumen,
	};
}
