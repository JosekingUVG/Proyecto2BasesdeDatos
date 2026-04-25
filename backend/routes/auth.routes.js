/*
  * Archivo: auth.routes.js
  * Descripción: Define las rutas relacionadas con la autenticación de usuarios, incluyendo el login, logout y la obtención de información del usuario autenticado, utilizando controladores específicos para manejar cada una de estas operaciones y documentando las rutas con Swagger para facilitar su uso y comprensión.
*/
import express from "express";
import { loginController, logoutController, meController } from "../controllers/endpoint.js";

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
  loginController(req, res);
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
  meController(req, res);
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
  logoutController(req, res);
});

export default router;