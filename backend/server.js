import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";

const app = express();

// ruta base
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});
// rutas de autenticación
app.use("/auth", authRoutes);
// rutas de productos
app.use("/productos", productosRoutes);
// rutas de ventas
app.use("/ventas", ventasRoutes);
// rutas de reportes
app.use("/reportes", reportesRoutes);
// swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// puerto
app.listen(5000, () => {
  console.log("Backend en puerto 5000");
});