import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || "tienda";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 5432;

export const sequelizeAdmin = new Sequelize(
	dbName,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: dbHost,
		port: dbPort,
		dialect: "postgres",
		logging: false,
	},
);

/**
 * Instancia Sequelize con las credenciales del empleado autenticado en Postgres.
 */
export function obtenerConexionPorUsuario(usuario, contrasena) {
	return new Sequelize(dbName, usuario, contrasena, {
		host: dbHost,
		port: dbPort,
		dialect: "postgres",
		logging: false,
	});
}
