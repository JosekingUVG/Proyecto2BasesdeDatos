# 📡 Documentación de Endpoints API

> Autenticación por usuario Postgres del seed (ej. `vendedor_juan` / `secret`).  
> Enviar el token en `Authorization: Bearer <token>` o `x-session-token`.  
> Matriz de permisos por rol: ver [roles.md](./roles.md).

---

## 🔐 Auth

### `POST /login`
Autenticación contra el DBMS. Abre una conexión Sequelize con el usuario y contraseña provistos, infiere el rol y crea la sesión.

**Request Body**
| Campo | Tipo | Ejemplo |
|---|---|---|
| `usuario` | string | `"vendedor_juan"` |
| `contrasena` | string | `"secret"` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Login exitoso — retorna `message`, `token` y `user` (`id_empleado`, `nombre`, `rol`) |
| `401` | Credenciales inválidas |

**Valores de `rol`:** `admin`, `subadmin`, `vendedor`, `digitador`, `auditor`

---

### `GET /me`
Obtener el usuario actualmente autenticado.

**Headers:** token requerido

**Responses**
| Código | Descripción |
|---|---|
| `200` | Retorna `id_empleado`, `nombre` y `rol` |
| `401` | No autenticado |

---

### `POST /logout`
Cerrar sesión y cerrar la conexión activa del usuario.

**Headers:** token requerido

**Responses**
| Código | Descripción |
|---|---|
| `200` | Logout exitoso |

---

## 📦 Productos

> Las columnas visibles (ej. `costo`) dependen del rol que firma la consulta en Postgres.

### `GET /productos`
Obtener inventario de productos con filtros opcionales.

**Acceso:** todos los roles autenticados

**Query Params**
| Param | Tipo | Requerido | Descripción | Ejemplo |
|---|---|---|---|---|
| `categoria` | string | No | Filtrar por categoría | `Procesadores` |
| `precio_min` | number | No | Filtrar por precio mínimo | `100` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Lista de productos |
| `401` | No autenticado |

---

### `POST /productos`
Crear un nuevo producto vía `sp_gestionar_producto` (acción `CREAR`).

**Acceso:** `admin`, `subadmin`, `digitador`

**Request Body**
| Campo | Tipo | Requerido | Ejemplo |
|---|---|---|---|
| `categoria` | string | ✅ | `"Electrónica"` |
| `precio` | number | ✅ | `1200` |
| `marca` | string | ✅ | `"Dell"` |
| `id_proveedor` | integer | ✅ | `1` |
| `cantidad` | integer | ✅ | `10` |
| `costo` | number | ✅ | `900` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Producto creado correctamente |
| `400` | Datos inválidos |
| `403` | Rol sin permiso |

---

### `PUT /productos/:id`
Actualizar un producto vía `sp_gestionar_producto` (acción `ACTUALIZAR`).

**Acceso:** `admin`, `subadmin`, `digitador`

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del producto |

**Request Body** *(todos opcionales; se fusionan con el registro actual)*
| Campo | Tipo | Ejemplo |
|---|---|---|
| `precio` | number | `150` |
| `categoria` | string | `"Electrónica"` |
| `marca` | string | `"Dell"` |
| `status_producto` | string | `"activo"` |
| `id_proveedor` | integer | `1` |
| `cantidad` | integer | `10` |
| `costo` | number | `900` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Producto actualizado correctamente |
| `404` | Producto no encontrado |
| `403` | Rol sin permiso |

---

### `PATCH /productos/:id/inventario`
Actualización inline de bodega (cantidad y precio) vía `sp_actualizar_inventario_inline`.

**Acceso:** `admin`, `digitador`

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del producto |

**Request Body**
| Campo | Tipo | Requerido | Ejemplo |
|---|---|---|---|
| `cantidad` | integer | ✅ | `25` |
| `precio` | number | ✅ | `450` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Inventario actualizado correctamente |
| `404` | Producto no encontrado |
| `403` | Rol sin permiso |

---

### `DELETE /productos/:id`
Baja lógica del producto (`status_producto = 'inactivo'`) vía `sp_cambiar_status_producto`.

**Acceso:** `admin`, `subadmin`, `digitador`

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del producto |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Producto eliminado correctamente |
| `404` | Producto no encontrado |
| `403` | Rol sin permiso |

---

## 🛒 Ventas

### `POST /ventas`
Registrar venta transaccional vía `sp_registrar_venta` (cabecera, detalle y descuento de stock en el DBMS).

**Acceso:** `admin`, `vendedor`

**Request Body**
| Campo | Tipo | Ejemplo |
|---|---|---|
| `id_empleado` | integer | `5` |
| `productos` | array | Ver estructura abajo |

**Estructura de `productos[]`**
| Campo | Tipo | Ejemplo |
|---|---|---|
| `id_producto` | integer | `1` |
| `cantidad` | integer | `2` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Venta creada — retorna `id_venta` y `total_vendido` |
| `400` | Error en datos o stock insuficiente |
| `403` | Rol sin permiso |
| `500` | Error en la transacción |

---

### `GET /ventas`
Listar todas las ventas realizadas.

**Acceso:** `admin`, `subadmin`, `auditor`

**Responses**
| Código | Descripción |
|---|---|
| `200` | Array de ventas con `id_venta`, `total_vendido`, `fecha_venta`, `nombre_empleado` |
| `403` | Rol sin permiso |

---

### `GET /ventas/:id`
Obtener el detalle de una venta específica.

**Acceso:** `admin`, `subadmin`, `auditor`

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID de la venta |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Objeto con `venta` (cabecera) y `detalle[]` (productos vendidos con subtotales) |
| `404` | Venta no encontrada |
| `403` | Rol sin permiso |

---

## 📊 Reportes

**Acceso (todos):** `admin`, `subadmin`, `auditor`

### `GET /reportes/fechas`
Reporte de ventas agrupado por día dentro de un rango de fechas.

**Query Params**
| Param | Tipo | Requerido | Ejemplo |
|---|---|---|---|
| `fecha_inicio` | date | ✅ | `2026-04-01` |
| `fecha_fin` | date | ✅ | `2026-04-22` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Objeto con `resumen` (totales del período) y `detalle[]` (por día con unidades, ingresos y ganancia) |
| `403` | Rol sin permiso |

---

### `GET /reportes/proveedores`
Reporte por proveedor. El resumen superior usa `sp_obtener_resumen_proveedores`; el detalle por mes vía consultas ORM.

**Responses**
| Código | Descripción |
|---|---|
| `200` | Objeto con `resumen` (`total_unidades`, `total_proveedores`) y `detalle[]` |
| `403` | Rol sin permiso |

---

### `GET /reportes/empleados`
Reporte de ventas por empleado en un mes específico.

**Query Params**
| Param | Tipo | Requerido | Ejemplo |
|---|---|---|---|
| `mes` | date | ✅ | `2026-04-01` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Objeto con `resumen` y `detalle[]` por empleado |
| `403` | Rol sin permiso |
