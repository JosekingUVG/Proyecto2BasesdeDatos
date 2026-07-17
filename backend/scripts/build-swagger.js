/**
 * Regenera swagger/openapi.json desde las anotaciones @swagger en backend/routes/*.js
 */
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const routesDir = path.join(backendRoot, "routes");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "API Tienda — Proyecto 2",
			version: "1.0.0",
			description:
				"API REST con autenticacion por usuario Postgres, roles del DBMS y stored procedures. " +
				"Tras POST /login, use Authorization Bearer <token> o x-session-token.",
		},
		servers: [{ url: "http://localhost:5000", description: "Backend local / Docker" }],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					description: "Token UUID devuelto por POST /login",
				},
				sessionToken: {
					type: "apiKey",
					in: "header",
					name: "x-session-token",
				},
			},
			schemas: {
				LoginRequest: {
					type: "object",
					required: ["usuario", "contrasena"],
					properties: {
						usuario: { type: "string", example: "vendedor_juan" },
						contrasena: { type: "string", example: "secret" },
					},
				},
				LoginResponse: {
					type: "object",
					properties: {
						message: { type: "string" },
						token: { type: "string" },
						user: { $ref: "#/components/schemas/UserSession" },
					},
				},
				UserSession: {
					type: "object",
					properties: {
						id_empleado: { type: "integer" },
						nombre: { type: "string" },
						rol: {
							type: "string",
							enum: ["admin", "subadmin", "vendedor", "digitador", "auditor"],
						},
					},
				},
				ErrorMessage: {
					type: "object",
					properties: { message: { type: "string" } },
				},
				ProductoCreate: {
					type: "object",
					required: [
						"categoria",
						"precio",
						"marca",
						"id_proveedor",
						"cantidad",
						"costo",
					],
					properties: {
						categoria: { type: "string", example: "Procesadores" },
						precio: { type: "number", example: 1200 },
						marca: { type: "string", example: "Intel" },
						id_proveedor: { type: "integer", example: 1 },
						cantidad: { type: "integer", example: 10 },
						costo: { type: "number", example: 900 },
					},
				},
				ProductoUpdate: {
					type: "object",
					properties: {
						precio: { type: "number" },
						categoria: { type: "string" },
						marca: { type: "string" },
						status_producto: { type: "string" },
						id_proveedor: { type: "integer" },
						cantidad: { type: "integer" },
						costo: { type: "number" },
					},
				},
				InventarioPatch: {
					type: "object",
					required: ["cantidad", "precio"],
					properties: {
						cantidad: { type: "integer", example: 25 },
						precio: { type: "number", example: 450 },
					},
				},
				VentaCreate: {
					type: "object",
					required: ["id_empleado", "productos"],
					properties: {
						id_empleado: { type: "integer", example: 5 },
						productos: {
							type: "array",
							items: { $ref: "#/components/schemas/VentaItem" },
						},
					},
				},
				VentaItem: {
					type: "object",
					required: ["id_producto", "cantidad"],
					properties: {
						id_producto: { type: "integer", example: 1 },
						cantidad: { type: "integer", example: 2 },
					},
				},
			},
			responses: {
				Unauthorized: {
					description: "No autenticado",
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/ErrorMessage" },
						},
					},
				},
				Forbidden: {
					description: "Sin permiso",
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/ErrorMessage" },
						},
					},
				},
			},
		},
	},
	apis: [
		path.join(routesDir, "auth.routes.js"),
		path.join(routesDir, "productos.routes.js"),
		path.join(routesDir, "ventas.routes.js"),
		path.join(routesDir, "reportes.routes.js"),
		path.join(backendRoot, "swagger", "paths.js"),
	],
};

const spec = swaggerJsdoc(options);
const outPath = path.join(backendRoot, "swagger", "openapi.json");
writeFileSync(outPath, JSON.stringify(spec, null, 2));

console.log(`Swagger generado: ${outPath}`);
console.log(`Endpoints: ${Object.keys(spec.paths || {}).length}`);
