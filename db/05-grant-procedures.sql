-- Permisos EXECUTE sobre stored procedures (ejecutar despues de 03-init-procedures.sql)

GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO rol_admin;

GRANT EXECUTE ON PROCEDURE sp_registrar_venta(integer, numeric, integer[], integer[], numeric[])
    TO rol_vendedor;

GRANT EXECUTE ON PROCEDURE sp_gestionar_producto(integer, character varying, numeric, character varying, integer, character varying, integer, numeric, character varying)
    TO rol_digitador, rol_subadmin;

GRANT EXECUTE ON PROCEDURE sp_cambiar_status_producto(integer, character varying)
    TO rol_digitador, rol_subadmin;

GRANT EXECUTE ON PROCEDURE sp_actualizar_inventario_inline(integer, integer, numeric)
    TO rol_digitador;

GRANT EXECUTE ON PROCEDURE sp_obtener_resumen_proveedores()
    TO rol_auditor, rol_subadmin;
