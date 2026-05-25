import express from "express";
import {
	getVentaByIdController,
	getVentasController,
	postVentaController,
} from "../controllers/ventas.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/roles.middleware.js";

const router = express.Router();

const lecturaVentas = requireRoles("admin", "subadmin", "auditor");
const crearVenta = requireRoles("admin", "vendedor");

/**
 * @swagger
 * tags:
 *   - name: Ventas
 *     description: Pedidos y consulta de ventas
 */

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Registrar venta transaccional
 *     description: Roles — admin, vendedor
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VentaCreate'
 *     responses:
 *       200:
 *         description: Venta creada
 *       400:
 *         description: Stock insuficiente o datos invalidos
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Listar ventas
 *     description: Roles — admin, subadmin, auditor
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post("/ventas", requireAuth, crearVenta, postVentaController);
router.get("/ventas", requireAuth, lecturaVentas, getVentasController);

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Detalle de venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Cabecera y detalle
 *       404:
 *         description: Venta no encontrada
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/ventas/:id", requireAuth, lecturaVentas, getVentaByIdController);

export default router;
