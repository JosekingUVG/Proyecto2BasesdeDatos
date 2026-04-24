# 🐳 Infraestructura

El sistema está completamente dockerizado con los siguientes servicios:

---

## Servicios

- **PostgreSQL** – base de datos relacional
- **Backend** – Node.js + Express
- **Frontend** – Node.js + Express + HTML
- **Adminer** – gestión visual de la base de datos

---

## Características

- Volumen persistente para la base de datos
- Inicialización automática con `database.sql`
- Configuración mediante variables de entorno (ver `.env.example` en la raíz del proyecto)