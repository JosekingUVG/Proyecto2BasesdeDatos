/*
  * Archivo: reportes.routes.js
  * Descripción: Define las rutas relacionadas con la generación de reportes, incluyendo el reporte de ventas por rango de fechas, el reporte de ventas por proveedor y el reporte de ventas por empleado en un mes específico, utilizando controladores específicos para manejar cada una de estas operaciones y documentando las rutas con Swagger para facilitar su uso y comprensión.
*/
import express from "express";
import {
  getReporteEmpleadosController,
  getReporteFechasController,
  getReporteProveedoresController,
} from "../controllers/endpoint.js";

const router = express.Router();

/**
 * @swagger
 * /reportes/fechas:
 *   get:
 *     summary: Reporte de ventas por rango de fechas
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-01
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-22
 *     responses:
 *       200:
 *         description: Reporte por fechas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     total_unidades:
 *                       type: integer
 *                     total_ingresos:
 *                       type: number
 *                     total_ganancia:
 *                       type: number
 *                 detalle:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fecha:
 *                         type: string
 *                       total_unidades:
 *                         type: integer
 *                       total_ingresos:
 *                         type: number
 *                       total_ganancia:
 *                         type: number
 */
router.get("/reportes/fechas", (req, res) => {
  getReporteFechasController(req, res);
});

/**
 * @swagger
 * /reportes/proveedores:
 *   get:
 *     summary: Reporte de ventas por proveedor
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Reporte por proveedor
 */
router.get("/reportes/proveedores", (req, res) => {
  getReporteProveedoresController(req, res);
});

/**
 * @swagger
 * /reportes/empleados:
 *   get:
 *     summary: Reporte de ventas por empleado en un mes
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: mes
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-01
 *     responses:
 *       200:
 *         description: Reporte por empleado
 */
router.get("/reportes/empleados", (req, res) => {
  getReporteEmpleadosController(req, res);
});

export default router;
