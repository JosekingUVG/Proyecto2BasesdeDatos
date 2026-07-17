import {
	crearVentaService,
	listarVentasService,
	obtenerVentaPorIdService,
} from "../services/ventas.services.js";

export async function postVentaController(req, res) {
	try {
		const venta = await crearVentaService(req.models, req.body);
		return res.status(200).json(venta);
	} catch (error) {
		const mensaje =
			error?.parent?.message ||
			error?.original?.message ||
			error.message ||
			"No se pudo registrar la venta";
		const esTransaccion =
			/transaccion|stock|producto|permiso|permission|insufficient/i.test(mensaje);
		return res.status(esTransaccion ? 400 : 500).json({ message: mensaje });
	}
}

export async function getVentasController(req, res) {
	try {
		const ventas = await listarVentasService(req.models);
		return res.status(200).json(ventas);
	} catch (error) {
		return res.status(500).json({ message: "Error al listar ventas", error: error.message });
	}
}

export async function getVentaByIdController(req, res) {
	try {
		const venta = await obtenerVentaPorIdService(req.models, req.params.id);
		if (!venta) {
			return res.status(404).json({ message: "Venta no encontrada" });
		}
		return res.status(200).json(venta);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}
