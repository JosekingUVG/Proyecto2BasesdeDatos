-- =============================================================================
-- 04-seed-data.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. REGISTROS DE CATÁLOGOS BASE (Proveedores y Productos)
-- -----------------------------------------------------------------------------
INSERT INTO proveedor (nombre_proveedor) VALUES
('Intel Corporation'), ('NVIDIA Global'), ('AMD Latin'), ('Logitech Latam'), ('Razer Inc.');

INSERT INTO producto (categoria, precio, marca, id_proveedor, status_producto, cantidad, costo) VALUES
('Procesadores', 2500.00, 'Intel', 1, 'activo', 15, 1900.00),
('Procesadores', 2800.00, 'AMD', 3, 'activo', 12, 2100.00),
('Tarjetas de Video', 4500.00, 'NVIDIA', 2, 'activo', 8, 3600.00),
('Tarjetas de Video', 3800.00, 'AMD', 3, 'activo', 10, 3000.00),
('Teclados', 450.00, 'Logitech', 4, 'activo', 25, 250.00),
('Teclados', 750.00, 'Razer', 5, 'activo', 20, 480.00),
('Mouses', 300.00, 'Logitech', 4, 'activo', 30, 150.00),
('Mouses', 600.00, 'Razer', 5, 'activo', 15, 350.00),
('Audífonos', 800.00, 'Razer', 5, 'activo', 18, 500.00),
('Monitores', 1800.00, 'Intel', 1, 'activo', 14, 1300.00);


-- -----------------------------------------------------------------------------
-- 2. REGISTROS DE EMPLEADOS EN TABLA OPERATIVA
-- -----------------------------------------------------------------------------
-- Mantenemos la inserción en la tabla 'empleado' para efectos de llaves foráneas 
-- y para mapear nombres completos en los reportes de UI.
INSERT INTO empleado (id_empleado, nombre, usuario, contrasena) VALUES
(1, 'Carlos Mendoza', 'admin_carlos', 'secret'),
(2, 'Ana Lucía Reyes', 'admin_ana', 'secret'),
(3, 'Roberto Gómez', 'sub_roberto', 'secret'),
(4, 'Elena Pastora', 'sub_elena', 'secret'),
(5, 'Juan Pérez', 'vendedor_juan', 'secret'),
(6, 'María López', 'vendedor_maria', 'secret'),
(7, 'Pedro Martínez', 'vendedor_pedro', 'secret'),
(8, 'Lucía Fuentes', 'vendedor_lucia', 'secret'),
(9, 'Diego Estévez', 'vendedor_diego', 'secret'),
(10, 'Sofía Castillo', 'vendedor_sofia', 'secret'),
(11, 'Miguel Ángel', 'digitador_miguel', 'secret'),
(12, 'Gabriela Ortiz', 'digitador_gaby', 'secret'),
(13, 'Fernando José', 'digitador_fer', 'secret'),
(14, 'Laura Méndez', 'digitador_laura', 'secret'),
(15, 'Alejandro Ruiz', 'digitador_ale', 'secret'),
(16, 'Ricardo Soto', 'auditor_ricardo', 'secret'),
(17, 'Patricia Lima', 'auditor_patricia', 'secret'),
(18, 'Jorge Herrera', 'auditor_jorge', 'secret'),
(19, 'Carmen Vega', 'auditor_carmen', 'secret'),
(20, 'Esteban Quito', 'auditor_esteban', 'secret');

-- Sincronizamos la secuencia del SERIAL debido a que forzamos los IDs numéricos manuales
SELECT setval('empleado_id_empleado_seq', 20);


-- -----------------------------------------------------------------------------
-- 3. CREACIÓN DE USUARIOS REALES EN DBMS Y ASIGNACIÓN DE ROLES (GRANT)
-- -----------------------------------------------------------------------------

-- GRUPO: Administradores (Acceso total)
CREATE USER admin_carlos WITH PASSWORD 'secret'; GRANT rol_admin TO admin_carlos;
CREATE USER admin_ana WITH PASSWORD 'secret';    GRANT rol_admin TO admin_ana;

-- GRUPO: Sub-Administradores (Catálogo y reportes, no generan ventas)
CREATE USER sub_roberto WITH PASSWORD 'secret';  GRANT rol_subadmin TO sub_roberto;
CREATE USER sub_elena WITH PASSWORD 'secret';    GRANT rol_subadmin TO sub_elena;

-- GRUPO: Vendedores (Crear ventas, consultar inventario básico)
CREATE USER vendedor_juan WITH PASSWORD 'secret';  GRANT rol_vendedor TO vendedor_juan;
CREATE USER vendedor_maria WITH PASSWORD 'secret'; GRANT rol_vendedor TO vendedor_maria;
CREATE USER vendedor_pedro WITH PASSWORD 'secret'; GRANT rol_vendedor TO vendedor_pedro;
CREATE USER vendedor_lucia WITH PASSWORD 'secret'; GRANT rol_vendedor TO vendedor_lucia;
CREATE USER vendedor_diego WITH PASSWORD 'secret'; GRANT rol_vendedor TO vendedor_diego;
CREATE USER vendedor_sofia WITH PASSWORD 'secret'; GRANT rol_vendedor TO vendedor_sofia;

-- GRUPO: Digitadores / Bodega (Edición in-line de inventario, stock y nuevos productos)
CREATE USER digitador_miguel WITH PASSWORD 'secret'; GRANT rol_digitador TO digitador_miguel;
CREATE USER digitador_gaby WITH PASSWORD 'secret';   GRANT rol_digitador TO digitador_gaby;
CREATE USER digitador_fer WITH PASSWORD 'secret';    GRANT rol_digitador TO digitador_fer;
CREATE USER digitador_laura WITH PASSWORD 'secret';  GRANT rol_digitador TO digitador_laura;
CREATE USER digitador_ale WITH PASSWORD 'secret';    GRANT rol_digitador TO digitador_ale;

-- GRUPO: Auditores (Solo lectura general para reportes analíticos)
CREATE USER auditor_ricardo WITH PASSWORD 'secret';  GRANT rol_auditor TO auditor_ricardo;
CREATE USER auditor_patricia WITH PASSWORD 'secret'; GRANT rol_auditor TO auditor_patricia;
CREATE USER auditor_jorge WITH PASSWORD 'secret';    GRANT rol_auditor TO auditor_jorge;
CREATE USER auditor_carmen WITH PASSWORD 'secret';   GRANT rol_auditor TO auditor_carmen;
CREATE USER auditor_esteban WITH PASSWORD 'secret';  GRANT rol_auditor TO auditor_esteban;


-- -----------------------------------------------------------------------------
-- 4. HISTORIAL DE VENTAS TRANSACCIONALES (INTEGRIDAD REFERENCIAL DE ROLES)
-- -----------------------------------------------------------------------------
-- Respetando tu regla de negocio: ÚNICAMENTE los IDs de vendedores (5-10) 
-- y administradores (1-2) generan registros transaccionales aquí.
INSERT INTO venta (id_venta, id_empleado, total_vendido, fecha_venta) VALUES
(1, 5, 2950.00, NOW() - INTERVAL '15 days'), -- Vendedor Juan
(2, 6, 4500.00, NOW() - INTERVAL '12 days'), -- Vendedora María
(3, 7, 750.00,  NOW() - INTERVAL '10 days'), -- Vendedor Pedro
(4, 1, 2500.00, NOW() - INTERVAL '8 days'),  -- Admin Carlos
(5, 8, 1100.00, NOW() - INTERVAL '5 days'),  -- Vendedora Lucía
(6, 9, 3800.00, NOW() - INTERVAL '3 days'),  -- Vendedor Diego
(7, 10, 600.00, NOW() - INTERVAL '1 day'),   -- Vendedora Sofía
(8, 2, 5300.00, NOW());                      -- Admin Ana

SELECT setval('venta_id_venta_seq', 8);

-- -----------------------------------------------------------------------------
-- 5. DETALLES DE LAS VENTAS
-- -----------------------------------------------------------------------------
INSERT INTO detalle_venta (id_venta, id_producto, cantidad_producto, precio_unitario) VALUES
(1, 1, 1, 2500.00), (1, 5, 1, 450.00), -- Venta 1
(2, 3, 1, 4500.00),                     -- Venta 2
(3, 6, 1, 750.00),                      -- Venta 3
(4, 1, 1, 2500.00),                     -- Venta 4
(5, 7, 1, 300.00), (5, 9, 1, 800.00),   -- Venta 5
(6, 4, 1, 3800.00),                     -- Venta 6
(7, 8, 1, 600.00),                      -- Venta 7
(8, 2, 1, 2800.00), (8, 1, 1, 2500.00); -- Venta 8