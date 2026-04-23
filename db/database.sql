-- =========================================
-- TABLA: proveedor
-- =========================================
CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre_proveedor VARCHAR(100) NOT NULL
);

-- =========================================
-- TABLA: empleado
-- =========================================
CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena TEXT NOT NULL
);

-- =========================================
-- TABLA: producto
-- =========================================
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    marca VARCHAR(50),
    id_proveedor INT NOT NULL,
    status_producto VARCHAR(20) DEFAULT 'activo',
    cantidad INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    costo NUMERIC(10,2) NOT NULL CHECK (costo >= 0),

    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (id_proveedor)
        REFERENCES proveedor(id_proveedor)
        ON DELETE RESTRICT
);

-- =========================================
-- TABLA: venta
-- =========================================
CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    id_empleado INT NOT NULL,
    total_vendido NUMERIC(12,2) NOT NULL CHECK (total_vendido >= 0),
    fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venta_empleado
        FOREIGN KEY (id_empleado)
        REFERENCES empleado(id_empleado)
        ON DELETE RESTRICT
);

-- =========================================
-- TABLA: detalle_venta
-- =========================================
CREATE TABLE detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_producto INT NOT NULL CHECK (cantidad_producto > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta)
        REFERENCES venta(id_venta)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
        ON DELETE RESTRICT
);