import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// ruta base
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});
// rutas de autenticación
app.use("/auth", authRoutes);
// swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// puerto
app.listen(5000, () => {
  console.log("Backend en puerto 5000");
});