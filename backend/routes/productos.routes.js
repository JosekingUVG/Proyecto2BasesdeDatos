import express from "express";

const router = express.Router();

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener inventario de productos
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtrar por categoría
 *         example: Electrónica
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         required: false
 *         description: Filtrar por precio mínimo
 *         example: 100
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/productos", (req, res) => {
  res.send("GET productos");
});


/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoria
 *               - precio
 *               - marca
 *               - id_proveedor
 *               - cantidad
 *               - costo
 *             properties:
 *               categoria:
 *                 type: string
 *                 example: Electrónica
 *               precio:
 *                 type: number
 *                 example: 1200
 *               marca:
 *                 type: string
 *                 example: Dell
 *               id_proveedor:
 *                 type: integer
 *                 example: 1
 *               cantidad:
 *                 type: integer
 *                 example: 10
 *               costo:
 *                 type: number
 *                 example: 900
 *     responses:
 *       200:
 *         description: Producto creado correctamente
 */
router.post("/productos", (req, res) => {
  res.send("POST producto");
});


/**
 * @swagger
 * /productos/{id}/stock:
 *   put:
 *     summary: Actualizar stock y costo promedio de un producto
 *     tags: [Productos]
 *     description: |
 *       Suma cantidad al inventario y recalcula el costo promedio del producto.
 *       La lógica del promedio se realiza en backend.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *               - costo_nuevo
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 example: 5
 *               costo_nuevo:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Stock actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.put("/productos/:id/stock", (req, res) => {
  res.send("PUT stock producto");
});


/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar información de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precio:
 *                 type: number
 *                 example: 150
 *               categoria:
 *                 type: string
 *                 example: Electrónica
 *               marca:
 *                 type: string
 *                 example: Dell
 *               status_producto:
 *                 type: string
 *                 example: Activo
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.put("/productos/:id", (req, res) => {
  res.send("PUT producto");
});


/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 *       400:
 *         description: No se puede eliminar (por restricción de clave foránea)
 */
router.delete("/productos/:id", (req, res) => {
  res.send("DELETE producto");
});

export default router;