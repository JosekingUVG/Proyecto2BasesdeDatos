import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.POSTGRES_USER || "proy2",
  password: process.env.POSTGRES_PASSWORD || "secret",
  database: process.env.POSTGRES_DB || "tienda",
});

export default pool;