-- Aplicar en BD existente si ya se inicializo sin UPDATE en producto para vendedor
GRANT UPDATE (cantidad) ON public.producto TO rol_vendedor;
