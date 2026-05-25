import {
	actualizarInventarioInlineService,
	actualizarProductoService,
	crearProductoService,
	eliminarProductoService,
	obtenerProductosService,
} from "../services/productos.services.js";

export async function getProductosController(req, res) {
	try {
		const productos = await obtenerProductosService(req.models, req.query);
		return res.status(200).json(productos);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function postProductoController(req, res) {
	try {
		const producto = await crearProductoService(req.models, req.body);
		return res.status(200).json({ message: "Producto creado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function putProductoController(req, res) {
	try {
		const producto = await actualizarProductoService(req.models, req.params.id, req.body);

		if (!producto) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({ message: "Producto actualizado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function patchInventarioController(req, res) {
	try {
		const producto = await actualizarInventarioInlineService(
			req.models,
			req.params.id,
			req.body,
		);

		if (!producto) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({ message: "Inventario actualizado correctamente", producto });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}

export async function deleteProductoController(req, res) {
	try {
		const eliminado = await eliminarProductoService(req.models, req.params.id);

		if (!eliminado) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({ message: "Producto eliminado correctamente" });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
}
