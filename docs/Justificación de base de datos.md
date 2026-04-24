# 📊 Base de datos

La base de datos está diseñada para gestionar productos, proveedores, empleados, ventas y detalle de ventas.

---

## Relaciones principales

- Un empleado realiza muchas ventas
- Una venta tiene muchos productos
- Un producto puede estar en muchas ventas
- Un proveedor tiene muchos productos

---

## Modelo relacional documentado
De las relaciones principales, se llego al siguiente modelo relacional

[modelo relacional](../img/conceptual.png) 

---

## Diagrama entidad relación 
El siguiente diagrama entidad relación muestra las entidades, atributos con sus tipos de datos, relaciones y cardinalidades. 

[Diagrama entidad relación](../img/erd.png) 



# 📐 Normalización de la base de datos (hasta 3FN)

## Punto de partida

Al iniciar el diseño, se identificaron dos entidades centrales del negocio: **productos** y **ventas**. A partir de ellas se aplicó el proceso de normalización de forma incremental.

---

## Primera Forma Normal (1FN)

> *Todos los atributos deben ser atómicos, sin grupos repetidos ni listas de valores.*

Se definieron dos tablas iniciales con todos sus campos. Cada celda contiene un único valor y cada fila es identificable por una clave primaria.

### Tabla inicial: `producto`

| Atributo | Tipo | Descripción |
|---|---|---|
| id_producto *(PK)* | serial | Identificador único del producto |
| categoria | varchar(50) | Categoría del producto |
| precio | numeric(10,2) | Precio de venta |
| marca | varchar(50) | Marca del producto |
| status_producto | varchar(20) | Estado del producto (activo/inactivo) |
| cantidad | integer | Stock disponible |
| costo | numeric(10,2) | Costo de adquisición |
| nombre_proveedor | varchar(100) | Nombre del proveedor |

### Tabla inicial: `venta`

| Atributo | Tipo | Descripción |
|---|---|---|
| id_venta *(PK)* | serial | Identificador único de la venta |
| total_vendido | numeric(12,2) | Total de la venta |
| fecha_venta | timestamp | Fecha y hora de la venta |
| nombre_empleado | varchar(100) | Nombre del empleado que realizó la venta |
| usuario | varchar(50) | Usuario del empleado |
| contrasena | text | Contraseña del empleado |
| id_producto | integer | Producto vendido |
| cantidad_producto | integer | Cantidad de unidades vendidas |
| precio_unitario | numeric(10,2) | Precio al momento de la venta |

✅ Ambas tablas cumplen 1FN: todos los campos son atómicos y no hay grupos repetidos.

---

## Segunda Forma Normal (2FN)

> *Todos los atributos no clave deben depender de la clave primaria completa, no de una parte de ella.*

Se identificaron atributos que no describían a la entidad principal sino a entidades relacionadas:

- En `producto`: `nombre_proveedor` describe al **proveedor**, no al producto.
- En `venta`: `nombre_empleado`, `usuario` y `contrasena` describen al **empleado**, no a la venta.

Para eliminar estas dependencias parciales, se crearon dos nuevas entidades independientes:

**`proveedor`** — extraído de `producto`

| Atributo | Tipo | Descripción |
|---|---|---|
| id_proveedor *(PK)* | serial | Identificador único del proveedor |
| nombre_proveedor | varchar(100) | Nombre del proveedor |

**`empleado`** — extraído de `venta`

| Atributo | Tipo | Descripción |
|---|---|---|
| id_empleado *(PK)* | serial | Identificador único del empleado |
| nombre | varchar(100) | Nombre completo del empleado |
| usuario | varchar(50) | Nombre de usuario para el sistema |
| contrasena | text | Contraseña de acceso |

En ambas tablas originales se reemplazaron los atributos descriptivos por sus respectivas **claves foráneas** (`id_proveedor`, `id_empleado`).

✅ Con esto se cumple 2FN: cada atributo depende únicamente de la clave primaria de su tabla.

---

## Tercera Forma Normal (3FN)

> *No deben existir dependencias transitivas: los atributos no clave no deben depender de otros atributos no clave.*

En la tabla `venta` se detectó una dependencia transitiva:

```
id_venta → id_producto → cantidad_producto, precio_unitario
```

Los campos `id_producto`, `cantidad_producto` y `precio_unitario` no dependen directamente de `id_venta`, sino del **producto dentro de esa venta**. Además, una venta puede incluir múltiples productos, lo que hace necesaria una tabla de relación.

Se separó esa información en una nueva entidad:

**`detalle_venta`** — extraído de `venta`

| Atributo | Tipo | Descripción |
|---|---|---|
| id_detalle *(PK)* | serial | Identificador único del detalle |
| id_venta *(FK)* | integer | Venta a la que pertenece |
| id_producto *(FK)* | integer | Producto vendido |
| cantidad_producto | integer | Unidades vendidas |
| precio_unitario | numeric(10,2) | Precio registrado al momento de la venta |

✅ Con esta separación se cumple 3FN: no existen dependencias transitivas en ninguna tabla.

---

## Resultado final

El proceso de normalización derivó en **5 tablas**, que coinciden exactamente con el modelo relacional implementado:

| Tabla | Origen |
|---|---|
| `producto` | Entidad inicial (1FN), sin atributos de proveedor (2FN) |
| `proveedor` | Extraída de `producto` en 2FN |
| `empleado` | Extraída de `venta` en 2FN |
| `venta` | Entidad inicial (1FN), sin atributos de empleado ni detalle (2FN, 3FN) |
| `detalle_venta` | Extraída de `venta` en 3FN |

## Manejo de costos

Se utiliza un modelo de **costo promedio ponderado**:

```text
nuevo_costo = (costo actual + costo nuevo) / 2
```

Esto permite:

- Simplificar el manejo de inventario
- Mantener consistencia en reportes
- Evitar la complejidad de rastrear múltiples lotes de compra
