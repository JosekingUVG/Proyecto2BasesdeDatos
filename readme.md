# 🛒 Sistema de Gestión de Inventario y Ventas

Aplicación web personal para la gestión de inventario, procesamiento de ventas, generación de reportes analíticos y control de acceso basado en roles con arquitectura por capas, base de datos relacional y contenedores Docker.

---

## 🌐 Enlaces de Producción

El sistema se encuentra desplegado y accesible en la nube mediante los siguientes servicios:

* **Frontend:** [https://proyecto2basesdedatos-1.onrender.com/](https://proyecto2basesdedatos-1.onrender.com/)

* **Backend (API REST):** [https://proyecto2basesdedatos.onrender.com/](https://proyecto2basesdedatos.onrender.com/)

* **Documentación (Swagger):** [https://proyecto2basesdedatos.onrender.com/swagger](https://www.google.com/search?q=https://proyecto2basesdedatos.onrender.com/swagger)

### Probar cada Grupo de usuarios (Credenciales Seguras)

| Rol | User | Password |
| --- | --- | --- |
| Admin: | admin_carlos | SecurePass2026![cite: 1] |
| SubAdmin: | sub_roberto | SecurePass2026![cite: 1] |
| Vendedor: | vendedor_maria | SecurePass2026![cite: 1] |
| Digitador: | digitador_gaby | SecurePass2026![cite: 1] |
| Auditor: | auditor_esteban | SecurePass2026![cite: 1] |

## 📌 Notas importantes

* El sistema implementa contraseñas robustas a nivel de base de datos y roles[cite: 1].
* Puede ejecutarse de manera automatizada mediante contenedores con `docker compose up`.

---

## 🚀 Ejecución Local

### Requisitos

* Docker
* Docker Compose

### Pasos para ejecutar

1. Clonar el repositorio usando la rama correspondiente:

```bash
git clone -b main git@github.com:JosekingUVG/Proyecto2BasesdeDatos.git
cd Proyecto2BasesdeDatos

```

2. Crear y configurar el archivo de variables de entorno (`.env`) basado en las necesidades locales.
3. Ejecutar el proyecto con contenedores:

```bash
docker compose up --build

```

### Servicios locales disponibles

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:3000

 |
| Backend | http://localhost:5000

 |
| Swagger (documentación) | http://localhost:5000/swagger

 |
| Adminer | http://localhost:8080

 |
| PostgreSQL | puerto 5432

 |

---

## ⚙️ Variables de entorno

Ejemplo de configuración para el archivo `.env`:

```env
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=SecurePass2026!
POSTGRES_DB=neondb

DB_HOST=db
DB_PORT=5432

```

---




---

## 📚 Documentación

| Documento | Descripción |
| --- | --- |
| [Justificación Arquitectura](https://www.google.com/search?q=docs/Justificacion%2520arquitectura.md)<br> | Arquitectura por capas del sistema y decisiones de diseño

 |
| [Arquitectura](https://www.google.com/search?q=docs/arquitectura.md)<br> | Arquitectura por capas del sistema y decisiones de diseño

 |
| [Base de datos](https://www.google.com/search?q=docs/Justificaci%C3%B3n%2520de%2520base%2520de%2520datos.md)<br> | Modelo relacional, relaciones, justificación 3fn, diagrama ER, modelo conceptual y manejo de costos

 |
| [Infraestructura](https://www.google.com/search?q=docs/justificacion%2520infraestructura.md)<br> | Configuración Docker y servicios

 |
| [Lógica del proyecto](https://www.google.com/search?q=docs/logica%2520del%2520proyecto.md)<br> | Lógica de negocio y flujos principales

 |
| [Endpoints](https://www.google.com/search?q=docs/endpoints.md)<br> | Referencia de la API REST

 |
| [Sentencias SQL](https://www.google.com/search?q=docs/sentenciasSQL.md)<br> | Queries y estructura de la base de datos

 |
| [Roles y permisos](https://www.google.com/search?q=docs/roles.md)<br> | Matriz de endpoints por rol y detalle de accesos

 |
