# 🧱 Arquitectura del sistema

El proyecto sigue una arquitectura por capas para separar responsabilidades y facilitar el mantenimiento.

---

## Backend (Node.js + Express)

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

---

## Frontend (Node.js + Express + HTML)

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

## 🧠 Decisiones de diseño

- **Arquitectura por capas** para claridad y escalabilidad
- **Docker** para garantizar reproducibilidad del entorno
- **SQL explícito** sin ORM, para mayor control y transparencia
- **Costo promedio ponderado** para simplificar el manejo de inventario
- **Separación frontend/backend** como criterio de aprendizaje
- **Documentación con Swagger** para facilitar la comprensión de la API