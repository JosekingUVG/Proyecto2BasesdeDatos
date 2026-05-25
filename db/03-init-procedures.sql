--================= SP REGISTRAR VENTA (Para la pestaña Nuevo pedido) =================
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    p_id_empleado INT,
    p_total_vendido NUMERIC,
    p_id_productos INT[],
    p_cantidades INT[],
    p_precios_unitarios NUMERIC[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta INT;
    i INT;
BEGIN
    -- BEGIN implícito del bloque de la estructura del PROCEDURE en Postgres
    
    -- 1. Insertar la cabecera de la venta
    INSERT INTO public.venta (id_empleado, total_vendido, fecha_venta)
    VALUES (p_id_empleado, p_total_vendido, CURRENT_TIMESTAMP)
    RETURNING id_venta INTO v_id_venta;

    -- 2. Iterar sobre los productos del pedido
    FOR i IN 1..array_length(p_id_productos, 1) LOOP
        
        -- Insertar el detalle
        INSERT INTO public.detalle_venta (id_venta, id_producto, cantidad_producto, precio_unitario)
        VALUES (v_id_venta, p_id_productos[i], p_cantidades[i], p_precios_unitarios[i]);

        -- Descontar del inventario (Stock)
        UPDATE public.producto
        SET cantidad = cantidad - p_cantidades[i]
        WHERE id_producto = p_id_productos[i];
        
    END LOOP;

    -- Si todo sale bien, los cambios se confirman automáticamente al terminar el bloque limpio
EXCEPTION
    WHEN OTHERS THEN
        -- Captura cualquier error (ej. stock negativo si pones un CHECK, ids inválidos)
        -- Realiza un ROLLBACK explícito de toda la operación
        ROLLBACK;
        RAISE EXCEPTION 'Error en la transacción de venta. Operación abortada: %', SQLERRM;
END;
$$;


-- ================= sp_gestionar_producto (Para la pestaña "Producto" - Agregar / Modificar) =================
CREATE OR REPLACE PROCEDURE sp_gestionar_producto(
    INOUT p_id_producto INT, -- IN para update, OUT para devolver el nuevo id generado
    p_categoria VARCHAR,
    p_precio NUMERIC,
    p_marca VARCHAR,
    p_id_proveedor INT,
    p_status_producto VARCHAR,
    p_cantidad INT,
    p_costo NUMERIC,
    p_accion VARCHAR -- 'CREAR' o 'ACTUALIZAR'
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_accion = 'CREAR' THEN
        INSERT INTO public.producto (categoria, precio, marca, id_proveedor, status_producto, cantidad, costo)
        VALUES (p_categoria, p_precio, p_marca, p_id_proveedor, p_status_producto, p_cantidad, p_costo)
        RETURNING id_producto INTO p_id_producto;
        
    ELSIF p_accion = 'ACTUALIZAR' THEN
        UPDATE public.producto
        SET categoria = p_categoria, precio = p_precio, marca = p_marca, 
            id_proveedor = p_id_proveedor, status_producto = p_status_producto, 
            cantidad = p_cantidad, costo = p_costo
        WHERE id_producto = p_id_producto;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al gestionar el producto: %', SQLERRM;
END;
$$;


-- ================ 3. sp_cambiar_status_producto (Para la edición inline / botón Eliminar del "Inventario") =================
CREATE OR REPLACE PROCEDURE sp_cambiar_status_producto(
    p_id_producto INT,
    p_nuevo_status VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.producto
    SET status_producto = p_nuevo_status
    WHERE id_producto = p_id_producto;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto con ID % no existe.', p_id_producto;
    END IF;
END;
$$;


-- ============= 4. sp_obtener_resumen_proveedores (Para la pestaña "Reportes" -> Reporte por Proveedor) =============
CREATE OR REPLACE PROCEDURE sp_obtener_resumen_proveedores(
    OUT p_total_unidades BIGINT,
    OUT p_total_proveedores BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        COALESCE(SUM(dv.cantidad_producto), 0),
        COUNT(DISTINCT pr.id_proveedor)
    INTO p_total_unidades, p_total_proveedores
    FROM public.proveedor pr
    JOIN public.producto p ON pr.id_proveedor = p.id_proveedor
    JOIN public.detalle_venta dv ON p.id_producto = dv.id_producto;
END;
$$;


-- ============= 5. sp_actualizar_inventario_inline (Para la edición inline de Cantidad/Precio en "Inventario") =============
CREATE OR REPLACE PROCEDURE sp_actualizar_inventario_inline(
    p_id_producto INT,
    p_nueva_cantidad INT,
    p_nuevo_precio NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.producto
    SET cantidad = p_nueva_cantidad,
        precio = p_nuevo_precio
    WHERE id_producto = p_id_producto;
END;
$$;