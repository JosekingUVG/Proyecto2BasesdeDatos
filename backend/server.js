import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

// ruta base
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});
// rutas de autenticación
app.use("/", authRoutes);
// rutas de productos
app.use("/", productosRoutes);
// rutas de ventas
app.use("/", ventasRoutes);
// rutas de reportes
app.use("/", reportesRoutes);
// swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// puerto
app.listen(port, () => {
  console.log(`Backend en puerto ${port}`);
});