import express from "express";
import {
	getReporteEmpleadosController,
	getReporteFechasController,
	getReporteProveedoresController,
} from "../controllers/reportes.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/roles.middleware.js";

const router = express.Router();

const lecturaReportes = requireRoles("admin", "subadmin", "auditor");

/**
 * @swagger
 * tags:
 *   - name: Reportes
 *     description: Analitica de ventas
 */

/**
 * @swagger
 * /reportes/fechas:
 *   get:
 *     summary: Reporte por rango de fechas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-04-01"
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-04-22"
 *     responses:
 *       200:
 *         description: Resumen y detalle por dia
 *       400:
 *         description: Fechas requeridas
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/reportes/fechas", requireAuth, lecturaReportes, getReporteFechasController);

/**
 * @swagger
 * /reportes/proveedores:
 *   get:
 *     summary: Reporte por proveedor
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Resumen (SP) y detalle por mes
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
	"/reportes/proveedores",
	requireAuth,
	lecturaReportes,
	getReporteProveedoresController,
);

/**
 * @swagger
 * /reportes/empleados:
 *   get:
 *     summary: Reporte por empleado en un mes
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     parameters:
 *       - in: query
 *         name: mes
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-04-01"
 *     responses:
 *       200:
 *         description: Resumen y detalle por empleado
 *       400:
 *         description: Parametro mes requerido
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
	"/reportes/empleados",
	requireAuth,
	lecturaReportes,
	getReporteEmpleadosController,
);

export default router;
