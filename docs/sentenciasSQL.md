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

---

## ⚙️ Acciones

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

## 🔍 Filtros individuales

### Por categoría

```sql
SELECT *
FROM   producto
WHERE  categoria = $1;
```

### Por precio mínimo

```sql
SELECT *
FROM   producto
WHERE  precio >= $1;
```

### Combinado (categoría + precio)

```sql
SELECT *
FROM   producto
WHERE  categoria = $1
  AND  precio   >= $2;
```