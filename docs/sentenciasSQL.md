# 🗄️ Sentencias SQL

---

## 🔐 Login

### Verificar credenciales

```sql
SELECT id_empleado, nombre, usuario
FROM   empleado
WHERE  usuario    = $1
  AND  contrasena = $2;
```

---

## 📦 Home / Inventario

### Vista completa con proveedor

```sql
SELECT
  p.id_producto,
  p.categoria,
  p.precio,
  p.marca,
  p.cantidad,
  p.status_producto,
  pr.nombre_proveedor
FROM  producto  p
JOIN  proveedor pr ON p.id_proveedor = pr.id_proveedor;
```

### Filtro por categoría y precio mínimo

> `$1` → categoría (optional), `$2` → precio mínimo (optional)

```sql
SELECT
  p.id_producto,
  p.categoria,
  p.precio,
  p.marca,
  p.cantidad,
  p.status_producto,
  pr.nombre_proveedor
FROM  producto  p
JOIN  proveedor pr ON p.id_proveedor = pr.id_proveedor
WHERE ($1::text    IS NULL OR p.categoria = $1)
  AND ($2::numeric IS NULL OR p.precio   >= $2);
```

### Editar campos de un producto

> `$1` precio · `$2` categoría · `$3` marca · `$4` cantidad · `$5` id_producto

```sql
UPDATE producto
SET
  precio    = COALESCE($1, precio),
  categoria = COALESCE($2, categoria),
  marca     = COALESCE($3, marca),
  cantidad  = COALESCE($4, cantidad)
WHERE id_producto = $5;
```

### Eliminar un producto

```sql
DELETE FROM producto
WHERE id_producto = $1;
```

---

## 🟢 Vista: Nuevo Pedido

> Solo consultas — todo lo relacionado a agregar productos al carrito se maneja en el **frontend**.

### Obtener productos activos

```sql
SELECT
  id_producto,
  marca,
  categoria,
  precio,
  cantidad
FROM producto
WHERE status_producto = 'activo';
```

### Filtro por categoría y precio mínimo

> `$1` → categoría (optional), `$2` → precio mínimo (optional)

```sql
SELECT
  id_producto,
  marca,
  categoria,
  precio,
  cantidad
FROM producto
WHERE status_producto = 'activo'
  AND ($1::text    IS NULL OR categoria = $1)
  AND ($2::numeric IS NULL OR precio   >= $2);
```

### Búsqueda por nombre / marca

> `$1` → texto a buscar

```sql
SELECT
  id_producto,
  marca,
  categoria,
  precio,
  cantidad
FROM producto
WHERE status_producto = 'activo'
  AND marca ILIKE '%' || $1 || '%';
```

---

## 🔴 Vista: Confirmar Pedido

> Aquí se ejecuta la transacción completa al presionar el botón de confirmar.

### Transacción de venta

```sql
BEGIN;

-- 1. Crear venta
INSERT INTO venta (id_empleado, total_vendido)
VALUES ($1, 0)
RETURNING id_venta;

-- 2. Insertar detalle por cada producto
--    (evita vender sin stock ✔)
--    $1 = id_venta · $2 = cantidad · $3 = id_producto
INSERT INTO detalle_venta (id_venta, id_producto, cantidad_producto, precio_unitario)
SELECT
  $1,
  p.id_producto,
  $2,
  p.precio
FROM producto p
WHERE p.id_producto      = $3
  AND p.status_producto  = 'activo'
  AND p.cantidad        >= $2;

-- 3. Actualizar stock
--    $1 = cantidad · $2 = id_producto
UPDATE producto
SET cantidad = cantidad - $1
WHERE id_producto = $2;

-- 4. Calcular total
SELECT SUM(cantidad_producto * precio_unitario)
FROM detalle_venta
WHERE id_venta = $1;

-- 5. Guardar total
--    $1 = total · $2 = id_venta
UPDATE venta
SET total_vendido = $1
WHERE id_venta = $2;

COMMIT;
```

> ⚠️ Si algo falla en cualquier paso:
> ```sql
> ROLLBACK;
> ```

---

## 🏷️ Vista: Producto

### Insertar producto nuevo

> `$1` categoría · `$2` precio · `$3` marca · `$4` id_proveedor · `$5` cantidad · `$6` costo

```sql
INSERT INTO producto (categoria, precio, marca, id_proveedor, cantidad, costo)
VALUES ($1, $2, $3, $4, $5, $6);
```

### Obtener producto por ID

```sql
SELECT *
FROM producto
WHERE id_producto = $1;
```

### Actualizar stock y costo

> `$1` cantidad a sumar · `$2` nuevo costo · `$3` id_producto

```sql
UPDATE producto
SET
  cantidad = cantidad + $1,
  costo    = $2
WHERE id_producto = $3;
```

---

## 📊 Reportes por Fechas

> `$1` → fecha inicio · `$2` → fecha fin

### Detalle por día

```sql
SELECT
  DATE(v.fecha_venta)                                       AS fecha,
  SUM(dv.cantidad_producto)                                 AS total_unidades,
  SUM(dv.cantidad_producto * dv.precio_unitario)            AS total_ingresos,
  SUM(dv.cantidad_producto * p.costo)                       AS total_costos,
  SUM(dv.cantidad_producto * dv.precio_unitario)
    - SUM(dv.cantidad_producto * p.costo)                   AS total_ganancia
FROM venta v
JOIN detalle_venta dv ON v.id_venta     = dv.id_venta
JOIN producto      p  ON dv.id_producto = p.id_producto
WHERE v.fecha_venta BETWEEN $1 AND $2
GROUP BY DATE(v.fecha_venta)
ORDER BY fecha;
```

### Totales generales del período

```sql
SELECT
  SUM(dv.cantidad_producto)                                 AS total_unidades,
  SUM(dv.cantidad_producto * dv.precio_unitario)            AS total_ingresos,
  SUM(dv.cantidad_producto * p.costo)                       AS total_costos,
  SUM(dv.cantidad_producto * dv.precio_unitario)
    - SUM(dv.cantidad_producto * p.costo)                   AS total_ganancia
FROM venta v
JOIN detalle_venta dv ON v.id_venta     = dv.id_venta
JOIN producto      p  ON dv.id_producto = p.id_producto
WHERE v.fecha_venta BETWEEN $1 AND $2;
```

---

## 🚚 Reportes por Proveedor

### Ventas por proveedor por mes

```sql
SELECT
  pr.nombre_proveedor,
  DATE_TRUNC('month', v.fecha_venta) AS mes,
  SUM(dv.cantidad_producto)          AS total_unidades
FROM proveedor     pr
JOIN producto      p  ON pr.id_proveedor = p.id_proveedor
JOIN detalle_venta dv ON p.id_producto   = dv.id_producto
JOIN venta         v  ON dv.id_venta     = v.id_venta
GROUP BY pr.nombre_proveedor, mes
ORDER BY mes, pr.nombre_proveedor;
```

### Total general de proveedores

```sql
SELECT
  SUM(dv.cantidad_producto)       AS total_unidades,
  COUNT(DISTINCT pr.id_proveedor) AS total_proveedores
FROM proveedor     pr
JOIN producto      p  ON pr.id_proveedor = p.id_proveedor
JOIN detalle_venta dv ON p.id_producto   = dv.id_producto;
```

---

## 👤 Reportes por Empleado

### Ventas por empleado en el mes

> `$1` → cualquier fecha del mes a consultar

```sql
SELECT
  e.nombre,
  COUNT(v.id_venta)    AS numero_ventas,
  SUM(v.total_vendido) AS total_vendido
FROM empleado e
JOIN venta v ON e.id_empleado = v.id_empleado
WHERE DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', $1::date)
GROUP BY e.nombre
ORDER BY total_vendido DESC;
```

### Total del mes

```sql
SELECT
  COUNT(v.id_venta)    AS total_ventas,
  SUM(v.total_vendido) AS total_vendido
FROM venta v
WHERE DATE_TRUNC('month', v.fecha_venta) = DATE_TRUNC('month', $1::date);
```