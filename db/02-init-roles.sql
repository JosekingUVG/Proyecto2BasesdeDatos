-- 1. Limpieza previa de roles si existen
DROP ROLE IF EXISTS rol_vendedor, rol_digitador, rol_auditor, rol_subadmin, rol_admin;

-- 2. Creación exacta de los 5 roles solicitados
CREATE ROLE rol_vendedor;
CREATE ROLE rol_digitador;
CREATE ROLE rol_auditor;
CREATE ROLE rol_subadmin;
CREATE ROLE rol_admin;

-- 3. Asignación de permisos granulares (GRANT)

-- Permisos para el Vendedor
GRANT SELECT ON public.producto, public.proveedor TO rol_vendedor;
GRANT SELECT, INSERT ON public.venta, public.detalle_venta TO rol_vendedor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_vendedor; -- Requerido para los campos SERIAL

-- Permisos para el Digitador
GRANT SELECT, INSERT, UPDATE ON public.producto TO rol_digitador;
GRANT SELECT ON public.proveedor TO rol_digitador;
GRANT USAGE, SELECT ON SEQUENCE producto_id_producto_seq TO rol_digitador;

-- Permisos para el Auditor
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_auditor;

-- Permisos para el Sub-Administrador
GRANT SELECT, INSERT, UPDATE ON public.producto, public.proveedor, public.empleado TO rol_subadmin;
GRANT SELECT ON public.venta, public.detalle_venta TO rol_subadmin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_subadmin;

-- Permisos para el Administrador
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;