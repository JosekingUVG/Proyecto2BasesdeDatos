import express from "express";
const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticación de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: juan
 *               contrasena:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_empleado:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", (req, res) => {
  res.send("login endpoint");
});

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_empleado:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *       401:
 *         description: No autenticado
 */
router.get("/me", (req, res) => {
  res.send("me endpoint");
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post("/logout", (req, res) => {
  res.send("logout endpoint");
});

export default router;