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

-- =======================================================0
-- INSERTS REALISTAS PARA LAS TABLAS (25 CADA TABLA)
-- =======================================================

-- Datos para proveedor
-- -------------------------------------------------------
INSERT INTO proveedor (nombre_proveedor) VALUES
('TechCorp'), ('Global Electronics'), ('Distribuidora Central'), ('Importadora GT'),
('Suministros Pro'), ('ElectroWorld'), ('MegaTech'), ('CompuStore'),
('Digital Hub'), ('Proveedor Uno'), ('Proveedor Dos'), ('Proveedor Tres'),
('Proveedor Cuatro'), ('Proveedor Cinco'), ('Proveedor Seis'),
('Proveedor Siete'), ('Proveedor Ocho'), ('Proveedor Nueve'),
('Proveedor Diez'), ('Proveedor Once'), ('Proveedor Doce'),
('Proveedor Trece'), ('Proveedor Catorce'), ('Proveedor Quince'),
('Proveedor Dieciseis');

-- Datos para Empleados
-- --------------------------------------------------------
INSERT INTO empleado (nombre, usuario, contrasena) VALUES
('Juan Perez','juan','1234'), ('Maria Lopez','maria','1234'),
('Carlos Ruiz','carlos','1234'), ('Ana Torres','ana','1234'),
('Luis Gomez','luis','1234'), ('Sofia Herrera','sofia','1234'),
('Pedro Morales','pedro','1234'), ('Lucia Castro','lucia','1234'),
('Diego Flores','diego','1234'), ('Elena Vargas','elena','1234'),
('Empleado11','emp11','1234'), ('Empleado12','emp12','1234'),
('Empleado13','emp13','1234'), ('Empleado14','emp14','1234'),
('Empleado15','emp15','1234'), ('Empleado16','emp16','1234'),
('Empleado17','emp17','1234'), ('Empleado18','emp18','1234'),
('Empleado19','emp19','1234'), ('Empleado20','emp20','1234'),
('Empleado21','emp21','1234'), ('Empleado22','emp22','1234'),
('Empleado23','emp23','1234'), ('Empleado24','emp24','1234'),
('Empleado25','emp25','1234');

-- Datos para productos
-- ---------------------------------------------------------
INSERT INTO producto (categoria, precio, marca, id_proveedor, cantidad, costo) VALUES
('Laptop', 1200, 'Dell', 1, 10, 900),
('Mouse', 50, 'Logitech', 2, 30, 30),
('Teclado', 80, 'Razer', 3, 20, 50),
('Audifonos', 200, 'Sony', 4, 15, 120),
('Monitor', 300, 'Samsung', 5, 12, 200),
('Laptop', 1500, 'HP', 6, 8, 1100),
('Mouse', 40, 'HP', 7, 25, 25),
('Teclado', 60, 'Redragon', 8, 18, 40),
('Audifonos', 180, 'JBL', 9, 14, 100),
('Monitor', 350, 'LG', 10, 10, 250),
('Tablet', 500, 'Apple', 11, 7, 400),
('Tablet', 300, 'Samsung', 12, 9, 220),
('Impresora', 250, 'Epson', 13, 5, 180),
('Impresora', 200, 'HP', 14, 6, 150),
('Camara', 800, 'Canon', 15, 4, 600),
('Camara', 700, 'Nikon', 16, 3, 500),
('Silla', 150, 'Ergo', 17, 10, 100),
('Escritorio', 400, 'OfficePro', 18, 6, 300),
('Router', 120, 'TP-Link', 19, 15, 80),
('Router', 140, 'Netgear', 20, 12, 90),
('USB', 20, 'Kingston', 21, 50, 10),
('Disco Duro', 100, 'Seagate', 22, 20, 70),
('SSD', 150, 'Samsung', 23, 18, 100),
('GPU', 600, 'Nvidia', 24, 5, 450),
('CPU', 500, 'Intel', 25, 6, 350);

-- Datos para Venta
-- ----------------------------------------
INSERT INTO venta (id_empleado, total_vendido, fecha_venta) VALUES
(1, 500, NOW()), (2, 300, NOW()), (3, 700, NOW()),
(4, 200, NOW()), (5, 450, NOW()), (6, 600, NOW()),
(7, 350, NOW()), (8, 900, NOW()), (9, 1200, NOW()),
(10, 150, NOW()), (11, 400, NOW()), (12, 550, NOW()),
(13, 650, NOW()), (14, 700, NOW()), (15, 800, NOW()),
(16, 300, NOW()), (17, 200, NOW()), (18, 1000, NOW()),
(19, 1100, NOW()), (20, 250, NOW()), (21, 450, NOW()),
(22, 500, NOW()), (23, 750, NOW()), (24, 850, NOW()),
(25, 950, NOW());

-- Datos para Detalle Venta
-- -------------------------------------------
INSERT INTO detalle_venta (id_venta, id_producto, cantidad_producto, precio_unitario) VALUES
(1,1,1,1200),(2,2,2,50),(3,3,1,80),(4,4,1,200),(5,5,1,300),
(6,6,1,1500),(7,7,2,40),(8,8,1,60),(9,9,1,180),(10,10,1,350),
(11,11,1,500),(12,12,1,300),(13,13,1,250),(14,14,1,200),(15,15,1,800),
(16,16,1,700),(17,17,1,150),(18,18,1,400),(19,19,1,120),(20,20,1,140),
(21,21,5,20),(22,22,2,100),(23,23,1,150),(24,24,1,600),(25,25,1,500);


