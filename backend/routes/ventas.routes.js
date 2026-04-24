import express from "express";
import {
  getVentaByIdController,
  getVentasController,
  postVentaController,
} from "../controllers/endpoint.js";

const router = express.Router();

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Crear una nueva venta (transacción completa)
 *     tags: [Ventas]
 *     description: |
 *       Crea una venta junto con su detalle y actualiza el stock.
 *       Esta operación debe ejecutarse dentro de una transacción SQL (BEGIN, COMMIT, ROLLBACK).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_empleado:
 *                 type: integer
 *                 example: 1
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_producto:
 *                       type: integer
 *                       example: 1
 *                     cantidad:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       200:
 *         description: Venta creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_venta:
 *                   type: integer
 *                 total_vendido:
 *                   type: number
 *       400:
 *         description: Error en los datos o stock insuficiente
 *       500:
 *         description: Error en la transacción
 */
router.post("/ventas", (req, res) => {
  postVentaController(req, res);
});


/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtener detalle de una venta
 *     tags: [Ventas]
 *     description: Devuelve los productos vendidos en una venta específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la venta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la venta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 venta:
 *                   type: object
 *                   properties:
 *                     id_venta:
 *                       type: integer
 *                     total_vendido:
 *                       type: number
 *                     fecha_venta:
 *                       type: string
 *                 detalle:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_producto:
 *                         type: integer
 *                       marca:
 *                         type: string
 *                       cantidad_producto:
 *                         type: integer
 *                       precio_unitario:
 *                         type: number
 *                       subtotal:
 *                         type: number
 *       404:
 *         description: Venta no encontrada
 */
router.get("/ventas/:id", (req, res) => {
  getVentaByIdController(req, res);
});


/**
 * @swagger
 * /ventas:
 *   get:
 *     summary: Listar ventas
 *     tags: [Ventas]
 *     description: Devuelve un listado de ventas realizadas
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_venta:
 *                     type: integer
 *                   total_vendido:
 *                     type: number
 *                   fecha_venta:
 *                     type: string
 *                   nombre_empleado:
 *                     type: string
 */
router.get("/ventas", (req, res) => {
  getVentasController(req, res);
});

export default router;