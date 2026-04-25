/*
  * Este archivo se encarga de configurar la conexión a la base de datos PostgreSQL utilizando el módulo 'pg'.
  * Se utiliza 'dotenv' para cargar las variables de entorno desde un archivo .env, lo que permite una configuración flexible.
  * El pool de conexiones se configura con los parámetros necesarios para conectarse a la base de datos, como host, puerto, usuario, contraseña y nombre de la base de datos.
  * Finalmente, se exporta el pool para que pueda ser utilizado en otras partes de la aplicación para ejecutar consultas SQL.
*/

import dotenv from "dotenv";
import pg from "pg";

// Cargamos las variables de entorno desde el archivo .env  
dotenv.config();

// Configuramos el pool de conexiones a la base de datos PostgreSQL
const { Pool } = pg;

// Creamos una nueva instancia del pool con la configuración obtenida de las variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.POSTGRES_USER || "proy2",
  password: process.env.POSTGRES_PASSWORD || "secret",
  database: process.env.POSTGRES_DB || "tienda",
});

// Exportamos el pool para que pueda ser utilizado en otras partes de la aplicación
export default pool;