import express from "express";
import {
	deleteProductoController,
	getProductosController,
	patchInventarioController,
	postProductoController,
	putProductoController,
} from "../controllers/productos.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/roles.middleware.js";

const router = express.Router();

const gestionCatalogo = requireRoles("admin", "subadmin", "digitador");
const inventarioInline = requireRoles("admin", "digitador");

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Inventario y catalogo
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listar inventario de productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         example: Procesadores
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         example: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         example: activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: Intel
 *     responses:
 *       200:
 *         description: Lista de productos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Crear producto
 *     description: Roles permitidos — admin, subadmin, digitador
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoCreate'
 *     responses:
 *       200:
 *         description: Producto creado
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/productos", requireAuth, getProductosController);
router.post("/productos", requireAuth, gestionCatalogo, postProductoController);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Productos]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoUpdate'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: No encontrado
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     summary: Baja logica (status inactivo)
 *     tags: [Productos]
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
 *         description: Producto dado de baja
 *       404:
 *         description: No encontrado
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put("/productos/:id", requireAuth, gestionCatalogo, putProductoController);

/**
 * @swagger
 * /productos/{id}/inventario:
 *   patch:
 *     summary: Actualizar cantidad y precio inline
 *     description: Roles — admin, digitador
 *     tags: [Productos]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioPatch'
 *     responses:
 *       200:
 *         description: Inventario actualizado
 *       404:
 *         description: No encontrado
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch(
	"/productos/:id/inventario",
	requireAuth,
	inventarioInline,
	patchInventarioController,
);
router.delete("/productos/:id", requireAuth, gestionCatalogo, deleteProductoController);

export default router;
