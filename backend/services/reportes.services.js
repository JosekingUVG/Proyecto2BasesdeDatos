export async function reporteFechasService(models, fechaInicio, fechaFin) {
	if (!fechaInicio || !fechaFin) {
		throw new Error("fecha_inicio y fecha_fin son requeridos");
	}

	const [resumen, detalle] = await Promise.all([
		models.procedimientos.reporteFechasResumen(fechaInicio, fechaFin),
		models.procedimientos.reporteFechasDetalle(fechaInicio, fechaFin),
	]);

	return { resumen, detalle };
}

export async function reporteProveedoresService(models) {
	const [resumen, detalle] = await Promise.all([
		models.procedimientos.obtenerResumenProveedores(),
		models.procedimientos.reporteProveedoresDetalle(),
	]);

	return { resumen, detalle };
}

export async function reporteEmpleadosService(models, mes) {
	if (!mes) {
		throw new Error("El parametro mes es requerido");
	}

	const [resumen, detalle] = await Promise.all([
		models.procedimientos.reporteEmpleadosResumen(mes),
		models.procedimientos.reporteEmpleadosDetalle(mes),
	]);

	return { resumen, detalle };
}
