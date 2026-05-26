# 🛒 Proyecto 3 – Actualización del Sistema de Inventario y Ventas

Aplicación web para la gestión de inventario y ventas de una tienda, desarrollada con arquitectura por capas, base de datos relacional y contenedores Docker.

En esta entrega se implementan funcionalidades avanzadas de gestión de productos, procesamiento de ventas, generación de reportes analíticos y control de acceso basado en roles. El sistema se levanta completamente con Docker Compose, incluyendo el backend en Node.js (Express), la base de datos PostgreSQL y una interfaz frontend interactiva.

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
### Probar cada Grupo de usuarios:

| Rol | User | Password |
|-----|------|----------|
| Admin: | admin_carlos | secret |
| SubAdmin: | sub_roberto | secret |
| Vendedor: | vendedor_maria | secret |
| Digitador: | digitador_gaby | secret |
| Auditor: | auditor_esteban | secret |



### Servicios disponibles

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Swagger (documentación) | http://localhost:5000/swagger |
| Adminer | http://localhost:8080 |
| PostgreSQL | puerto 5432 |

---

## ⚙️ Variables de entorno

Archivo `.env.example`:

```env
POSTGRES_USER=proy3
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

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Justificación Arquitectura](docs/Justificacion%20arquitectura.md) | Arquitectura por capas del sistema y decisiones de diseño |
| [Arquitectura](docs/arquitectura.md) | Arquitectura por capas del sistema y decisiones de diseño |
| [Base de datos](docs/Justificación%20de%20base%20de%20datos.md) | Modelo relacional, relaciones, justificación 3fn, diagrama ER, modelo conceptual y manejo de costos |
| [Infraestructura](docs/justificacion%20infraestructura.md) | Configuración Docker y servicios |
| [Lógica del proyecto](docs/logica%20del%20proyecto.md) | Lógica de negocio y flujos principales |
| [Endpoints](docs/endpoints.md) | Referencia de la API REST |
| [Sentencias SQL](docs/sentenciasSQL.md) | Queries y estructura de la base de datos |
| [Roles y permisos](docs/roles.md) | Matriz de endpoints por rol y detalle de accesos |
