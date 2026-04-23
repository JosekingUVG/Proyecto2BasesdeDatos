import express from "express";
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
  res.send("GET reporte por fechas");
});

export default router;

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
  res.send("GET reporte por proveedores");
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
    res.send("GET reporte por empleados");
});
