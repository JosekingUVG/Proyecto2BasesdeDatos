# 📁 Estructura del Proyecto

```
mi-proyecto/
├── backend/                          # Servidor de Node.js (Express)
│   ├── config/
│   │   └── db.js                     # Pool dinámico de Sequelize que conecta con el usuario autenticado
│   ├── controllers/                  # Capa HTTP: Procesa req y envía res
│   │   ├── auth.controller.js        # Manejo de logins e inicio de conexiones
│   │   ├── productos.controller.js   # Flujo de inventario y stock
│   │   ├── reportes.controller.js    # Flujo de analítica y resúmenes
│   │   └── ventas.controller.js      # Flujo de pedidos y carritos
│   ├── models/                       # Capa de Datos (Mapeo ORM y SP)
│   │   ├── DetalleVenta.js           # Mapeo de la tabla 'detalle_venta'
│   │   ├── Empleado.js               # Mapeo de la tabla 'empleado'
│   │   ├── Producto.js               # Mapeo de la tabla 'producto'
│   │   ├── Proveedor.js              # Mapeo de la tabla 'proveedor'
│   │   ├── Venta.js                  # Mapeo de la tabla 'venta'
│   │   └── procedimientos.js         # Centralizador de llamadas 'CALL' a Stored Procedures
│   ├── routes/                       # Despachadores de URL de la API
│   │   ├── auth.routes.js            # /api/auth
│   │   ├── productos.routes.js       # /api/productos
│   │   ├── reportes.routes.js        # /api/reportes
│   │   └── ventas.routes.js          # /api/ventas
│   └── services/                     # Capa de Negocio (Validaciones y coordinación)
│       ├── auth.service.js           # Lógica de sesiones y tokens
│       ├── productos.service.js      # Reglas numéricas de productos y stock
│       ├── reportes.service.js       # Consolidación analítica de datos
│       └── ventas.service.js         # Mapeo de estructuras complejas hacia el SP de ventas
├── db/                               # Inicialización automatizada del DBMS en Docker
│   ├── 01-init-tables.sql            # Estructura de tablas (DDL base)
│   ├── 02-init-roles.sql             # Configuración de los 5 Roles del DBMS (Privilegios)
│   ├── 03-init-procedures.sql        # Declaración de los 5 Stored Procedures (PL/pgSQL)
│   └── 04-seed-data.sql              # Inserción de catálogos y creación de los 20 usuarios reales
├── docs/                             # Documentación del proyecto general
├── frontend/                         # Código de la interfaz de usuario (Cliente)
│   ├── node_modules/                 # Dependencias de npm para el frontend
│   └── src/                          # Código fuente de la aplicación del lado del cliente
│       ├── components/               # Elementos de la interfaz y layouts reutilizables
│       │   └── elementos-reutilizables.js
│       ├── controllers/              # Controladores encargados de interactuar y manipular el DOM
│       │   ├── inventario-dom.js
│       │   ├── logica-dom.js
│       │   ├── pedido-dom.js
│       │   ├── producto-dom.js
│       │   └── reportes-dom.js
│       ├── services/                 # Módulos para peticiones HTTP (Fetch/Axios) al Backend
│       │   └── consumo-api.js
│       ├── styles/                   # Hojas de estilo globales y particulares
│       │   └── styles.css
│       └── views/                    # Archivos HTML (Vistas de la aplicación)
│           ├── htmls.html
│           ├── inventario.html
│           ├── nuevo-pedido.html
│           ├── producto.html
│           └── reportes.html
├── img/                              # Archivos de imágenes y assets estáticos generales
├── .dockerignore                     # Archivos excluidos del contexto de Docker
├── .env                              # Variables de entorno locales (Privado)
├── .env.example                      # Plantilla de las variables de entorno necesarias
├── .gitignore                        # Archivos y carpetas excluidos de Git
├── docker-compose.yml                # Orquestación de los contenedores de Docker
└── readme.md                         # Descripción general e instrucciones del proyecto
```