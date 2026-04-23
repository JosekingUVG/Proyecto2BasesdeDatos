# 📡 Documentación de Endpoints API

---

## 🔐 Auth

### `POST /login`
Autenticación de usuario.

**Request Body**
| Campo | Tipo | Ejemplo |
|---|---|---|
| `usuario` | string | `"juan"` |
| `contrasena` | string | `"1234"` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Login exitoso — retorna `message` y objeto `user` (`id_empleado`, `nombre`) |
| `401` | Credenciales inválidas |

---

### `GET /me`
Obtener el usuario actualmente autenticado.

**Responses**
| Código | Descripción |
|---|---|
| `200` | Retorna `id_empleado` y `nombre` |
| `401` | No autenticado |

---

### `POST /logout`
Cerrar sesión.

**Responses**
| Código | Descripción |
|---|---|
| `200` | Logout exitoso |

---

## 📦 Productos

### `GET /productos`
Obtener inventario de productos con soporte de filtros opcionales.

**Query Params**
| Param | Tipo | Requerido | Descripción | Ejemplo |
|---|---|---|---|---|
| `categoria` | string | No | Filtrar por categoría | `Electrónica` |
| `precio_min` | number | No | Filtrar por precio mínimo | `100` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Lista de productos |

---

### `POST /productos`
Crear un nuevo producto.

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

---

### `PUT /productos/:id`
Actualizar información de un producto.

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del producto |

**Request Body** *(todos opcionales)*
| Campo | Tipo | Ejemplo |
|---|---|---|
| `precio` | number | `150` |
| `categoria` | string | `"Electrónica"` |
| `marca` | string | `"Dell"` |
| `status_producto` | string | `"Activo"` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Producto actualizado correctamente |
| `404` | Producto no encontrado |

---

### `PUT /productos/:id/stock`
Actualizar stock y recalcular costo promedio de un producto.
> La lógica del costo promedio se maneja en el backend.

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del producto |

**Request Body**
| Campo | Tipo | Requerido | Ejemplo |
|---|---|---|---|
| `cantidad` | integer | ✅ | `5` |
| `costo_nuevo` | number | ✅ | `1000` |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Stock actualizado correctamente |
| `404` | Producto no encontrado |

---

### `DELETE /productos/:id`
Eliminar un producto.

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID del producto a eliminar |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Producto eliminado correctamente |
| `404` | Producto no encontrado |
| `400` | No se puede eliminar (restricción de clave foránea) |

---

## 🛒 Ventas

### `POST /ventas`
Crear una nueva venta con su detalle completo y actualización de stock.
> Esta operación se ejecuta dentro de una transacción SQL (`BEGIN` / `COMMIT` / `ROLLBACK`).

**Request Body**
| Campo | Tipo | Ejemplo |
|---|---|---|
| `id_empleado` | integer | `1` |
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
| `500` | Error en la transacción |

---

### `GET /ventas`
Listar todas las ventas realizadas.

**Responses**
| Código | Descripción |
|---|---|
| `200` | Array de ventas con `id_venta`, `total_vendido`, `fecha_venta`, `nombre_empleado` |

---

### `GET /ventas/:id`
Obtener el detalle de una venta específica.

**Path Params**
| Param | Tipo | Descripción |
|---|---|---|
| `id` | integer | ID de la venta |

**Responses**
| Código | Descripción |
|---|---|
| `200` | Objeto con `venta` (cabecera) y `detalle[]` (productos vendidos con subtotales) |
| `404` | Venta no encontrada |

---

## 📊 Reportes

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

---

### `GET /reportes/proveedores`
Reporte de ventas agrupado por proveedor.

**Responses**
| Código | Descripción |
|---|---|
| `200` | Reporte por proveedor |

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
| `200` | Reporte por empleado del mes indicado |