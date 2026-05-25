import {
	reporteEmpleadosService,
	reporteFechasService,
	reporteProveedoresService,
} from "../services/reportes.services.js";

export async function getReporteFechasController(req, res) {
	try {
		const { fecha_inicio, fecha_fin } = req.query;
		const reporte = await reporteFechasService(req.models, fecha_inicio, fecha_fin);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function getReporteProveedoresController(req, res) {
	try {
		const reporte = await reporteProveedoresService(req.models);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(500).json({ message: "Error en reporte", error: error.message });
	}
}

export async function getReporteEmpleadosController(req, res) {
	try {
		const { mes } = req.query;
		const reporte = await reporteEmpleadosService(req.models, mes);
		return res.status(200).json(reporte);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}
