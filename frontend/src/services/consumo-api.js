const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5000`;

function authHeaders(token) {
	return {
		Authorization: `Bearer ${token}`,
		"x-session-token": token,
	};
}

async function parseResponse(response) {
	let data = null;
	try {
		data = await response.json();
	} catch (error) {
		data = null;
	}

	if (!response.ok) {
		const message = data?.message || "Error en la solicitud";
		throw new Error(message);
	}

	return data;
}

export async function loginRequest(usuario, contrasena) {
	const response = await fetch(`${API_BASE_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ usuario, contrasena }),
	});

	return parseResponse(response);
}

export async function meRequest(token) {
	const response = await fetch(`${API_BASE_URL}/me`, {
		method: "GET",
		headers: authHeaders(token),
	});

	return parseResponse(response);
}

export async function logoutRequest(token) {
	const response = await fetch(`${API_BASE_URL}/logout`, {
		method: "POST",
		headers: authHeaders(token),
	});

	return parseResponse(response);
}

export async function inventarioRequest(
	{ categoria = "", precio_min = "", status = "", search = "" } = {},
	token = "",
) {
	const params = new URLSearchParams();
	if (categoria) params.append("categoria", categoria);
	if (precio_min !== "" && precio_min !== null && precio_min !== undefined) {
		params.append("precio_min", String(precio_min));
	}
	if (status) params.append("status", status);
	if (search) params.append("search", String(search));

	const query = params.toString();
	const response = await fetch(`${API_BASE_URL}/productos${query ? `?${query}` : ""}`, {
		method: "GET",
		headers: token ? authHeaders(token) : {},
	});

	return parseResponse(response);
}

export async function actualizarProductoRequest(idProducto, payload, token = "") {
	const response = await fetch(`${API_BASE_URL}/productos/${idProducto}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			...(token ? authHeaders(token) : {}),
		},
		body: JSON.stringify(payload),
	});

	return parseResponse(response);
}

export async function eliminarProductoRequest(idProducto, token = "") {
	const response = await fetch(`${API_BASE_URL}/productos/${idProducto}`, {
		method: "DELETE",
		headers: token ? authHeaders(token) : {},
	});

	return parseResponse(response);
}

export async function crearVentaRequest(payload, token = "") {
	const response = await fetch(`${API_BASE_URL}/ventas`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? authHeaders(token) : {}),
		},
		body: JSON.stringify(payload),
	});

	return parseResponse(response);
}

export async function crearProductoRequest(payload, token = "") {
	const response = await fetch(`${API_BASE_URL}/productos`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? authHeaders(token) : {}),
		},
		body: JSON.stringify(payload),
	});

	return parseResponse(response);
}

export async function actualizarStockRequest(idProducto, payload, token = "") {
	const response = await fetch(`${API_BASE_URL}/productos/${idProducto}/stock`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			...(token ? authHeaders(token) : {}),
		},
		body: JSON.stringify(payload),
	});

	return parseResponse(response);
}

export async function reporteFechasRequest(fechaInicio, fechaFin, token = "") {
	const params = new URLSearchParams({
		fecha_inicio: fechaInicio,
		fecha_fin: fechaFin,
	});

	const response = await fetch(`${API_BASE_URL}/reportes/fechas?${params.toString()}`, {
		method: "GET",
		headers: token ? authHeaders(token) : {},
	});

	return parseResponse(response);
}

export async function reporteProveedoresRequest(token = "") {
	const response = await fetch(`${API_BASE_URL}/reportes/proveedores`, {
		method: "GET",
		headers: token ? authHeaders(token) : {},
	});

	return parseResponse(response);
}

export async function reporteEmpleadosRequest(mes, token = "") {
	const params = new URLSearchParams({ mes });
	const response = await fetch(`${API_BASE_URL}/reportes/empleados?${params.toString()}`, {
		method: "GET",
		headers: token ? authHeaders(token) : {},
	});

	return parseResponse(response);
}
