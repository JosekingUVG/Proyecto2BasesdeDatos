# 👥 Matriz de Roles, Responsabilidades y Permisos de la API

## 📋 1. Resumen de Responsabilidades por Rol

| Rol del DBMS | Tablas Accesibles | Operaciones Permitidas (SQL) | Propósito en la UI |
|---|---|---|---|
| `rol_vendedor` | `producto`, `proveedor` / `venta`, `detalle_venta` | SELECT / SELECT, INSERT | Ver inventario, crear un "Nuevo Pedido". |
| `rol_digitador` | `producto` / `proveedor` | SELECT, INSERT, UPDATE / SELECT | "Gestión de Productos" (Agregar) y edición in-line en "Inventario". |
| `rol_auditor` | Todas las tablas | SELECT (Solo lectura) | Ver "Inventario" (sin cambios) y generar "Reportes". |
| `rol_subadmin` | `producto`, `proveedor`, `empleado` / `venta`, `detalle_venta` | SELECT, INSERT, UPDATE / SELECT | Gestión completa de catálogo y visualización de "Reportes". Sin "Nuevo Pedido". |
| `rol_admin` | Todas las tablas | SELECT, INSERT, UPDATE, DELETE | Acceso total a todas las vistas y operaciones del sistema. |

- **Administrador (`admin`):** Control total del sistema. Puede realizar transacciones operativas, gestionar el catálogo de productos y visualizar toda la analítica financiera y de costos.
- **Sub-Administrador (`subadmin`):** Encargado de la supervisión comercial. Puede gestionar el catálogo de productos y analizar reportes, pero no puede realizar operaciones de venta directa en caja ni alterar el stock físico inline de bodega.
- **Vendedor (`vendedor`):** Rol puramente transaccional del día a día. Su única función de escritura es registrar ventas a través del punto de venta. Puede consultar el inventario para ver existencias, pero no puede ver los costos de adquisición ni modificar productos.
- **Digitador / Bodega (`digitador`):** Encargado del control físico del inventario. Puede añadir nuevos productos al catálogo y actualizar stock/precios directamente desde la tabla, pero tiene bloqueado el acceso a todo el módulo de ventas y reportes financieros.
- **Auditor (`auditor`):** Rol de solo lectura y análisis. Puede inspeccionar el historial de ventas, ver el inventario y examinar todos los reportes analíticos para control de calidad, pero tiene prohibido alterar cualquier dato (sin permisos de inserción, edición o borrado).

---

## 🏁 2. Matriz General de Endpoints por Rol

| Módulo | Endpoint | Admin | Sub-Admin | Vendedor | Digitador | Auditor |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **🔐 Auth** | `POST /api/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
|  | `GET /api/auth/me` | ✅ | ✅ | ✅ | ✅ | ✅ |
|  | `POST /api/auth/logout` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **📦 Productos** | `GET /api/productos` | ✅ | ✅ | ✅ | ✅ | ✅ |
|  | `POST /api/productos` | ✅ | ✅ | ❌ | ✅ | ❌ |
|  | `PUT /api/productos/:id` | ✅ | ✅ | ❌ | ✅ | ❌ |
|  | `DELETE /api/productos/:id` | ✅ | ✅ | ❌ | ✅ | ❌ |
|  | `PATCH /api/productos/:id/inventario` | ✅ | ❌ | ❌ | ✅ | ❌ |
| **🛒 Ventas** | `POST /api/ventas` | ✅ | ❌ | ✅ | ❌ | ❌ |
|  | `GET /api/ventas` | ✅ | ✅ | ❌ | ❌ | ✅ |
|  | `GET /api/ventas/:id` | ✅ | ✅ | ❌ | ❌ | ✅ |
| **📊 Reportes** | `GET /api/reportes/fechas` | ✅ | ✅ | ❌ | ❌ | ✅ |
|  | `GET /api/reportes/proveedores` | ✅ | ✅ | ❌ | ❌ | ✅ |
|  | `GET /api/reportes/empleados` | ✅ | ✅ | ❌ | ❌ | ✅ |

---

## 🛠️ 3. Detalle de Endpoints Ocupados y No Ocupados por Rol

### 🥇 Administrador (`admin`)

**Endpoints que SÍ ocupa:** Todos los disponibles en la aplicación sin ninguna restricción.

**Endpoints que NO ocupa:** Ninguno.

---

### 🥈 Sub-Administrador (`subadmin`)

**Endpoints que SÍ ocupa:**

- `GET /api/productos` — Monitorear el catálogo.
- `POST /api/productos` y `PUT /api/productos/:id` — Modificar especificaciones de marcas o categorías.
- `DELETE /api/productos/:id` — Dar de baja lógica a productos descontinuados.
- `GET /api/ventas` y `GET /api/ventas/:id` — Auditar transacciones.
- Todos los de la sección de **📊 Reportes** (`/fechas`, `/proveedores`, `/empleados`).

**Endpoints que NO ocupa (Bloqueados):**

- `PATCH /api/productos/:id/inventario` — No puede alterar stock inline de bodega.
- `POST /api/ventas` — No tiene permitido operar la caja registradora para crear pedidos.

---

### 🥉 Vendedor (`vendedor`)

**Endpoints que SÍ ocupa:**

- `GET /api/productos` — Consultar stock disponible para ofrecer a los clientes.
- `POST /api/ventas` — Crear nuevos pedidos y facturar de forma transaccional.

**Endpoints que NO ocupa (Bloqueados):**

- Operaciones de catálogo (`POST`, `PUT`, `DELETE`, `PATCH` en `/api/productos`). No puede alterar datos base ni inventario.
- Módulo histórico de ventas (`GET /api/ventas` y `/ventas/:id`). No puede revisar transacciones ajenas o pasadas.
- Todo el módulo de **📊 Reportes**. Bloqueado por completo para evitar filtración de rendimientos comerciales masivos.

---

### 🏗️ Digitador / Bodega (`digitador`)

**Endpoints que SÍ ocupa:**

- `GET /api/productos` — Inspeccionar estados físicos en el sistema.
- `POST /api/productos` — Ingresar nuevos productos que entran al almacén.
- `PUT /api/productos/:id` y `DELETE /api/productos/:id` — Corregir fichas de productos.
- `PATCH /api/productos/:id/inventario` — Modificar directamente las cantidades físicas y precios al recibir camiones de proveedores.

**Endpoints que NO ocupa (Bloqueados):**

- Todo el módulo de **🛒 Ventas** (`POST /api/ventas`, `GET /api/ventas`). No tiene relación con la facturación.
- Todo el módulo de **📊 Reportes**. No tiene autorización para evaluar métricas de ganancias o rendimiento de personal.

---

### 🔍 Auditor (`auditor`)

**Endpoints que SÍ ocupa:**

- `GET /api/productos` — Verificar la consistencia del catálogo de inventario.
- `GET /api/ventas` y `GET /api/ventas/:id` — Revisar facturas emitidas, subtotales y cuadres financieros.
- Todos los de la sección de **📊 Reportes** — Analizar fluctuaciones por rangos de tiempo, compras a proveedores y comisiones/ventas de empleados.

**Endpoints que NO ocupa (Bloqueados):**

- Tiene estrictamente denegado **cualquier endpoint que use métodos `POST`, `PUT`, `DELETE` o `PATCH`** en todo el sistema. El auditor no altera flujos de caja ni modifica existencias; su cuenta es de lectura pura a nivel operativo.