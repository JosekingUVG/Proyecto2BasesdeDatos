Rol del DBMSTablas AccesiblesOperaciones Permitidas (SQL)Propósito en la UIrol_vendedorproducto, proveedorventa, detalle_ventaSELECTSELECT, INSERTVer inventario, crear un "Nuevo Pedido".rol_digitadorproductoproveedorSELECT, INSERT, UPDATESELECT"Gestión de Productos" (Agregar) y edición in-line en "Inventario".rol_auditorTodas las tablasSELECT (Solo lectura)Ver "Inventario" (sin cambios) y generar "Reportes".rol_subadminproducto, proveedor, empleadoventa, detalle_ventaSELECT, INSERT, UPDATESELECTGestión completa de catálogo y visualización de "Reportes". Sin "Nuevo Pedido".rol_adminTodas las tablasSELECT, INSERT, UPDATE, DELETEAcceso total a todas las vistas y operaciones del sistema.

Aquí tienes el archivo Markdown estructurado que detalla la matriz de accesos y responsabilidades por cada rol del DBMS. Este documento mapea exactamente qué hace cada usuario, qué endpoints tiene permitidos (`SI`) y cuáles tiene explícitamente bloqueados (`NO`), lo cual te servirá como una excelente documentación de seguridad para la entrega del proyecto.

---

# 👥 Matriz de Roles, Responsabilidades y Permisos de la API

## 📋 1. Resumen de Responsabilidades por Rol

* **Administrador (`admin`):** Control total del sistema. Puede realizar transacciones operativas, gestionar el catálogo de productos y visualizar toda la analítica financiera y de costos.
* **Sub-Administrador (`subadmin`):** Encargado de la supervisión comercial. Puede gestionar el catálogo de productos y analizar reportes, pero no puede realizar operaciones de venta directa en caja ni alterar el stock físico inline de bodega.
* **Vendedor (`vendedor`):** Rol puramente transaccional del día a día. Su única función de escritura es registrar ventas a través del punto de venta. Puede consultar el inventario para ver existencias, pero no puede ver los costos de adquisición ni modificar productos.
* **Digitador / Bodega (`digitador`):** Encargado del control físico del inventario. Puede añadir nuevos productos al catálogo y actualizar stock/precios directamente desde la tabla, pero tiene bloqueado el acceso a todo el módulo de ventas y reportes financieros.
* **Auditor (`auditor`):** Rol de solo lectura y análisis. Puede inspeccionar el historial de ventas, ver el inventario y examinar todos los reportes analíticos para control de calidad, pero tiene prohibido alterar cualquier dato (sin permisos de inserción, edición o borrado).

---

## 🏁 2. Matriz General de Endpoints por Rol

| Módulo | Endpoint | Admin | Sub-Admin | Vendedor | Digitador | Auditor |
| --- | --- | --- | --- | --- | --- | --- |
| **🔐 Auth** | `POST /api/auth/login` | **SI** | **SI** | **SI** | **SI** | **SI** |
|  | `GET /api/auth/me` | **SI** | **SI** | **SI** | **SI** | **SI** |
|  | `POST /api/auth/logout` | **SI** | **SI** | **SI** | **SI** | **SI** |
| **📦 Productos** | `GET /api/productos` | **SI** | **SI** | **SI** | **SI** | **SI** |
|  | `POST /api/productos` | **SI** | **SI** | **NO** | **SI** | **NO** |
|  | `PUT /api/productos/:id` | **SI** | **SI** | **NO** | **SI** | **NO** |
|  | `DELETE /api/productos/:id` | **SI** | **SI** | **NO** | **SI** | **NO** |
|  | `PATCH /api/productos/:id/inventario` | **SI** | **NO** | **NO** | **SI** | **NO** |
| **🛒 Ventas** | `POST /api/ventas` | **SI** | **NO** | **SI** | **NO** | **NO** |
|  | `GET /api/ventas` | **SI** | **SI** | **NO** | **NO** | **SI** |
|  | `GET /api/ventas/:id` | **SI** | **SI** | **NO** | **NO** | **SI** |
| **📊 Reportes** | `GET /api/reportes/fechas` | **SI** | **SI** | **NO** | **NO** | **SI** |
|  | `GET /api/reportes/proveedores` | **SI** | **SI** | **NO** | **NO** | **SI** |
|  | `GET /api/reportes/empleados` | **SI** | **SI** | **NO** | **NO** | **SI** |

---

## 🛠️ 3. Detalle de Endpoints Ocupados y No Ocupados por Rol

### 🥇 Administrador (`admin`)

* **Endpoints que SÍ ocupa:**
* Todos los disponibles en la aplicación sin ninguna restricción.


* **Endpoints que NO ocupa:** Ninguno.

### 🥈 Sub-Administrador (`subadmin`)

* **Endpoints que SÍ ocupa:**
* `GET /api/productos` (Monitorear el catálogo).
* `POST /api/productos` y `PUT /api/productos/:id` (Modificar especificaciones de marcas o categorías).
* `DELETE /api/productos/:id` (Dar de baja lógica a productos descontinuados).
* `GET /api/ventas` y `GET /api/ventas/:id` (Auditar transacciones).
* Todos los de la sección de **📊 Reportes** (`/fechas`, `/proveedores`, `/empleados`).


* **Endpoints que NO ocupa (Bloqueados):**
* `PATCH /api/productos/:id/inventario` (No puede alterar stock inline de bodega).
* `POST /api/ventas` (No tiene permitido operar la caja registradora para crear pedidos).



### 🥉 Vendedor (`vendedor`)

* **Endpoints que SÍ ocupa:**
* `GET /api/productos` (Consultar stock disponible para ofrecer a los clientes).
* `POST /api/ventas` (Crear nuevos pedidos y facturar de forma transaccional).


* **Endpoints que NO ocupa (Bloqueados):**
* Operaciones de catálogo (`POST`, `PUT`, `DELETE`, `PATCH` en `/api/productos`). No puede alterar datos base ni inventario.
* Módulo histórico de ventas (`GET /api/ventas` y `/ventas/:id`). No puede revisar transacciones ajenas o pasadas.
* Todo el módulo de **📊 Reportes**. Bloqueado por completo para evitar filtración de rendimientos comerciales masivos.



### 🏗️ Digitador / Bodega (`digitador`)

* **Endpoints que SÍ ocupa:**
* `GET /api/productos` (Inspeccionar estados físicos en el sistema).
* `POST /api/productos` (Ingresar nuevos productos que entran al almacén).
* `PUT /api/productos/:id` y `DELETE /api/productos/:id` (Corregir fichas de productos).
* `PATCH /api/productos/:id/inventario` (Modificar directamente las cantidades físicas y precios al recibir camiones de proveedores).


* **Endpoints que NO ocupa (Bloqueados):**
* Todo el módulo de **🛒 Ventas** (`POST /api/ventas`, `GET /api/ventas`). No tiene relación con la facturación.
* Todo el módulo de **📊 Reportes**. No tiene autorización para evaluar métricas de ganancias o rendimiento de personal.



### 🔍 Auditor (`auditor`)

* **Endpoints que SÍ ocupa:**
* `GET /api/productos` (Verificar la consistencia del catálogo de inventario).
* `GET /api/ventas` y `GET /api/ventas/:id` (Revisar facturas emitidas, subtotales y cuadres financieros).
* Todos los de la sección de **📊 Reportes** (Analizar fluctuaciones por rangos de tiempo, compras a proveedores y comisiones/ventas de empleados).


* **Endpoints que NO ocupa (Bloqueados):**
* Tiene estrictamente denegado **cualquier endpoint que use métodos `POST`, `PUT`, `DELETE` o `PATCH**` en todo el sistema. El auditor no altera flujos de caja ni modifica existencias; su cuenta es de lectura pura a nivel operativo.