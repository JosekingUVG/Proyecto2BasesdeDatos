import express from "express";
import {
	loginController,
	logoutController,
	meController,
} from "../controllers/auth.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticacion y sesion
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticacion de usuario
 *     description: Valida usuario/contrasena en Postgres y devuelve token de sesion.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales invalidas
 */
router.post("/login", loginController);

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Usuario actual con rol
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSession'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", requireAuth, meController);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Cerrar sesion
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/logout", requireAuth, logoutController);

export default router;
