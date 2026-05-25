/**
 * Definiciones OpenAPI centralizadas para swagger-jsdoc.
 * @module swagger/paths
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Login, sesion y cierre (publico excepto /me y /logout)
 *   - name: Productos
 *     description: Inventario y catalogo (requiere autenticacion)
 *   - name: Ventas
 *     description: Registro y consulta de ventas
 *   - name: Reportes
 *     description: Analitica por fechas, proveedores y empleados
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticacion de usuario
 *     description: Valida credenciales contra Postgres, abre conexion por rol y devuelve token de sesion.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     description: Devuelve datos del empleado y su rol (`admin`, `subadmin`, `vendedor`, `digitador`, `auditor`).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSession'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Cerrar sesion
 *     description: Invalida la sesion y cierra la conexion Sequelize del usuario.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout exitoso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listar inventario de productos
 *     description: Todos los roles autenticados. Columnas sensibles (ej. costo) dependen del rol en Postgres.
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *         example: Procesadores
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         description: Precio minimo
 *         example: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado del producto
 *         example: activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busqueda parcial en marca o categoria
 *         example: Intel
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_producto: { type: integer }
 *                   categoria: { type: string }
 *                   precio: { type: number }
 *                   marca: { type: string }
 *                   cantidad: { type: integer }
 *                   status_producto: { type: string }
 *                   costo: { type: number }
 *                   id_proveedor: { type: integer }
 *                   nombre_proveedor: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Crear producto
 *     description: Invoca `sp_gestionar_producto` (CREAR). Roles permitidos — admin, subadmin, digitador.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 producto: { type: object }
 *       400:
 *         description: Datos invalidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     description: Invoca `sp_gestionar_producto` (ACTUALIZAR). Roles — admin, subadmin, digitador.
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
 *         description: ID del producto
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
 *         description: Producto no encontrado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     summary: Baja logica de producto
 *     description: Invoca `sp_cambiar_status_producto` con status `inactivo`. Roles — admin, subadmin, digitador.
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
 *         description: Producto no encontrado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /productos/{id}/inventario:
 *   patch:
 *     summary: Actualizar cantidad y precio inline
 *     description: Invoca `sp_actualizar_inventario_inline`. Roles — admin, digitador.
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
 *         description: Producto no encontrado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Registrar venta transaccional
 *     description: Invoca `sp_registrar_venta`. Roles — admin, vendedor.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VentaResumen'
 *       400:
 *         description: Stock insuficiente o datos invalidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Error en la transaccion
 *   get:
 *     summary: Listar ventas
 *     description: Roles — admin, subadmin, auditor.
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
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
 *                   id_venta: { type: integer }
 *                   total_vendido: { type: number }
 *                   fecha_venta: { type: string, format: date-time }
 *                   nombre_empleado: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Detalle de una venta
 *     description: Cabecera y lineas de detalle. Roles — admin, subadmin, auditor.
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
 *         description: Venta con detalle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 venta:
 *                   type: object
 *                   properties:
 *                     id_venta: { type: integer }
 *                     total_vendido: { type: number }
 *                     fecha_venta: { type: string, format: date-time }
 *                     nombre_empleado: { type: string }
 *                 detalle:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_producto: { type: integer }
 *                       marca: { type: string }
 *                       cantidad_producto: { type: integer }
 *                       precio_unitario: { type: number }
 *                       subtotal: { type: number }
 *       404:
 *         description: Venta no encontrada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /reportes/fechas:
 *   get:
 *     summary: Reporte de ventas por rango de fechas
 *     description: Roles — admin, subadmin, auditor.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     total_unidades: { type: integer }
 *                     total_ingresos: { type: number }
 *                     total_costos: { type: number }
 *                     total_ganancia: { type: number }
 *                 detalle:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fecha: { type: string, format: date }
 *                       total_unidades: { type: integer }
 *                       total_ingresos: { type: number }
 *                       total_ganancia: { type: number }
 *       400:
 *         description: Parametros faltantes o invalidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /reportes/proveedores:
 *   get:
 *     summary: Reporte por proveedor
 *     description: Resumen via `sp_obtener_resumen_proveedores` y detalle por mes. Roles — admin, subadmin, auditor.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *       - sessionToken: []
 *     responses:
 *       200:
 *         description: Resumen y detalle por proveedor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     total_unidades: { type: integer }
 *                     total_proveedores: { type: integer }
 *                 detalle:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_proveedor: { type: string }
 *                       mes: { type: string }
 *                       total_unidades: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /reportes/empleados:
 *   get:
 *     summary: Reporte de ventas por empleado (mes)
 *     description: Roles — admin, subadmin, auditor.
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
 *         description: Cualquier fecha del mes a consultar
 *         example: "2026-04-01"
 *     responses:
 *       200:
 *         description: Resumen y detalle por empleado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     total_ventas: { type: integer }
 *                     total_vendido: { type: number }
 *                 detalle:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre: { type: string }
 *                       numero_ventas: { type: integer }
 *                       total_vendido: { type: number }
 *       400:
 *         description: Parametro mes requerido
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

export {};
