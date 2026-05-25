Aquí tienes la lista completa y detallada de tus endpoints mapeados al formato exacto de tu archivo `endpoints.md`.

Se han organizado por módulo, especificando su nuevo archivo correspondiente, su estado (**MANTENER**, **MODIFICAR** o **AGREGAR**) y las restricciones de acceso que el nuevo middleware validará para cumplir con la rúbrica de control de acceso.

---

# 📡 Documentación de Endpoints API (Actualizada para Roles y ORM)

## 🔐 Auth

*Todos los endpoints de esta sección pertenecen a: `backend/routes/auth.routes.js` y `backend/controllers/auth.controller.js*`

### `POST /login`

* **Estado:** 🔄 **MODIFICAR INTERNAMENTE**
* **Descripción:** Autenticación de usuario. Ya no realiza un `SELECT` plano de validación. Intenta abrir una conexión dinámica al DBMS con el usuario y contraseña provistos. Si tiene éxito, extrae el **rol real del DBMS** y lo guarda en la sesión.
* **Acceso:** Público (Cualquier usuario sin autenticar).

### `GET /me`

* **Estado:** 🔄 **MODIFICAR EN RESPUESTA**
* **Descripción:** Obtener el usuario actualmente autenticado.
* **Acceso:** Todos los usuarios autenticados.
* **Cambio en Response:** Ahora añade el campo `rol` (ej. `"vendedor"`, `"auditor"`, `"digitador"`) en el JSON de respuesta para que el Frontend configure dinámicamente la interfaz de usuario.

### `POST /logout`

* **Estado:** ✅ **MANTENER**
* **Descripción:** Cerrar sesión y destruir la instancia de conexión activa en el servidor.
* **Acceso:** Todos los usuarios autenticados.

---

## 📦 Productos

*Todos los endpoints de esta sección pertenecen a: `backend/routes/productos.routes.js` y `backend/controllers/productos.controller.js*`

### `GET /productos`

* **Estado:** ✅ **MANTENER**
* **Descripción:** Obtener inventario de productos con soporte de filtros opcionales.
* **Acceso:** Permitido para **Todos los roles** (`admin`, `subadmin`, `vendedor`, `digitador`, `auditor`).
* *Nota:* El motor de base de datos ocultará o denegará columnas sensibles (como el `costo`) automáticamente según el rol que firme la consulta.

### `POST /productos`

* **Estado:** 🔄 **MODIFICAR INTERNAMENTE**
* **Descripción:** Crear un nuevo producto en el catálogo. Se elimina la consulta SQL directa y se sustituye por la invocación al Stored Procedure `sp_gestionar_producto` con la acción de creación.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Digitador**.

### `PUT /productos/:id`

* **Estado:** 🔄 **MODIFICAR INTERNAMENTE**
* **Descripción:** Editar campos base de un producto (Categoría, Marca, Proveedor). Invoca internamente al Stored Procedure `sp_gestionar_producto` con la acción de actualización.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Digitador**.

### `DELETE /productos/:id`

* **Estado:** 🔄 **MODIFICAR INTERNAMENTE**
* **Descripción:** Dar de baja lógica a un producto en el sistema. Se elimina la sentencia `DELETE` tradicional y pasa a invocar el Stored Procedure `sp_cambiar_status_producto` para alternar su estado a `'inactivo'`.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Digitador**.

### `PATCH /productos/:id/inventario`

* **Estado:** ✨ **NUEVO ENDPOINT**
* **Descripción:** Modificación rápida en línea (*Inline*) de los valores operativos de bodega: `cantidad` (Stock) y `precio` directamente desde la vista de inventario. Invoca al Stored Procedure `sp_actualizar_inventario_inline`.
* **Request Body:** Objeto con `{ cantidad, precio }`.
* **Acceso:** Exclusivo para **Admin y Digitador** *(Los sub-administradores y vendedores tienen prohibido alterar existencias de forma directa aquí)*.

---

## 🛒 Ventas

*Todos los endpoints de esta sección pertenecen a: `backend/routes/ventas.routes.js` y `backend/controllers/ventas.controller.js*`

### `POST /ventas`

* **Estado:** 🔄 **MODIFICAR INTERNAMENTE**
* **Descripción:** Registrar un nuevo pedido (Venta Transaccional). Se elimina toda la lógica imperativa en JS de bucles, inserciones manuales y el manejo de rollback manual. El servicio ahora parsea el carrito en tres arreglos planos de Postgres (`ids`, `cantidades`, `precios`) y delega la atomicidad completa al Stored Procedure transaccional `sp_registrar_venta`.
* **Acceso:** Exclusivo para **Admin y Vendedor** *(Un auditor o digitador no puede registrar transacciones operativas)*.

### `GET /ventas`

* **Estado:** ✅ **MANTENER**
* **Descripción:** Listar todas las ventas realizadas para el histórico de auditoría.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Auditor**.

### `GET /ventas/:id`

* **Estado:** ✅ **MANTENER**
* **Descripción:** Obtener el detalle analítico y la cabecera de una venta específica mediante el uso de consultas del ORM.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Auditor**.

---

## 📊 Reportes

*Todos los endpoints de esta sección pertenecen a: `backend/routes/reportes.routes.js` y `backend/controllers/reportes.controller.js*`

### `GET /reportes/fechas`

* **Estado:** ✅ **MANTENER**
* **Descripción:** Reporte de ventas agrupado por día dentro de un rango de fechas.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Auditor**.

### `GET /reportes/proveedores`

* **Estado:** 🔄 **MODIFICAR INTERNAMENTE**
* **Descripción:** Reporte de ventas y resúmenes analíticos acumulados por proveedor. Modifica su comportamiento interno para invocar al Stored Procedure `sp_obtener_resumen_proveedores` para alimentar los KPI superiores de la UI.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Auditor**.

### `GET /reportes/empleados`

* **Estado:** ✅ **MANTENER**
* **Descripción:** Reporte analítico de rendimiento y volumen de ventas generado por cada empleado en un mes específico.
* **Acceso:** Exclusivo para **Admin, Sub-Admin y Auditor**.