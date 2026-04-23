# 🛒 Proyecto 2 – Sistema de Inventario y Ventas

Aplicación web para la gestión de inventario y ventas de una tienda, desarrollada con arquitectura por capas, base de datos relacional y contenedores Docker.

---

## 🚀 Ejecución del proyecto

### Requisitos

- Docker
- Docker Compose

### Pasos para ejecutar

1. Clonar el repositorio:

```bash
git clone https://github.com/JosekingUVG/Proyecto2BasesdeDatos.git
cd Proyecto2BasesdeDatos
```

2. Crear archivo de variables de entorno:

```bash
cp .env.example .env
```

3. Ejecutar el proyecto:

```bash
docker compose up --build
```

### Servicios disponibles

| Servicio   | URL |
|------------|-----|
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:5000 |
| Swagger (documentación)   | http://localhost:5000/swagger |
| Adminer    | http://localhost:8080 |
| PostgreSQL | puerto 5432 |

---

## 🧱 Arquitectura del sistema

El proyecto sigue una arquitectura por capas para separar responsabilidades y facilitar el mantenimiento.

### Backend (Node.js + Express)

```text
routes      → endpoints (HTTP)
controllers → manejo de request/response
services    → lógica de negocio
models      → consultas SQL
```

**Flujo:**

```text
Frontend → Route → Controller → Service → Model → Database
```

### Frontend (Node.js + Express + HTML)

```text
views       → HTML (vistas)
controllers → lógica de interacción
services    → consumo de API (fetch)
components  → elementos reutilizables
styles      → CSS
```

**Flujo:**

```text
Vista HTML → Controller JS → API → Backend
```

---

## 📊 Base de datos

La base de datos está diseñada para gestionar productos, proveedores, empleados, ventas y detalle de ventas.

### Relaciones principales

- Un empleado realiza muchas ventas
- Una venta tiene muchos productos
- Un producto puede estar en muchas ventas
- Un proveedor tiene muchos productos

### Manejo de costos

Se utiliza un modelo de **costo promedio ponderado**:

```text
nuevo_costo = (costo actual + costo nuevo) / 2
```

Esto permite simplificar el manejo de inventario, mantener consistencia en reportes y evitar la complejidad de rastrear múltiples lotes de compra.

---

## 🐳 Infraestructura

El sistema está completamente dockerizado con los siguientes servicios:

- **PostgreSQL** – base de datos relacional
- **Backend** – Node.js + Express
- **Frontend** – Node.js + Express + HTML
- **Adminer** – gestión visual de la base de datos

Incluye volumen persistente para la base de datos, inicialización automática con `database.sql` y configuración mediante variables de entorno.

---

## ⚙️ Variables de entorno

Archivo `.env.example`:

```env
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda

DB_HOST=db
DB_PORT=5432
```

---

## 📌 Notas importantes

- Las credenciales están definidas según los requisitos del proyecto
- El sistema se levanta únicamente con `docker compose up`
- No se requiere configuración adicional

---

## 🧠 Decisiones de diseño

- **Arquitectura por capas** para claridad y escalabilidad
- **Docker** para garantizar reproducibilidad del entorno
- **SQL explícito** sin ORM, para mayor control y transparencia
- **Costo promedio ponderado** para simplificar el manejo de inventario
- **Separación frontend/backend** como criterio de aprendizaje
- **Documentación con Swagger** para facilitar la comprensión de la API