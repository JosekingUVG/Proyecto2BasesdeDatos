import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Especificacion OpenAPI estatica (swagger/openapi.json).
 * No depende de swagger-jsdoc en runtime: evita fallos en Docker por rutas relativas.
 * Regenerar tras cambiar anotaciones en routes/: npm run swagger:build
 */
const specPath = path.join(__dirname, "openapi.json");
const swaggerSpec = JSON.parse(readFileSync(specPath, "utf8"));

export default swaggerSpec;
