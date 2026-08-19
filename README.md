# Task Manager — Proyecto base

## Contexto del caso

Este repositorio es lo que queda de un MVP construido en ~6 semanas por un equipo
de 2 desarrolladores para validar una idea con un primer cliente. El equipo original
ya no está en el proyecto. Tú y tu cohorte son el equipo que lo recibe ahora, con
el mandato de evolucionarlo hacia algo sostenible.

No se te dice qué está mal. Esa es exactamente la primera tarea: auditar,
documentar decisiones y proponer un rumbo arquitectónico.

## Qué hace la aplicación

Un gestor de tareas simple con tres capacidades:

- **Usuarios**: registro, login (JWT), listado.
- **Tareas**: crear, listar (con filtros), cambiar de estado, eliminar. Cada tarea
  tiene una prioridad calculada automáticamente según su fecha límite y si está
  marcada como urgente.
- **Notificaciones**: se generan automáticamente cuando se asigna o se completa
  una tarea.

## Cómo levantarlo (dentro de tu VM Ubuntu)

```bash
git clone <url-del-repo>
cd task-manager
cp .env.example .env
docker compose up --build
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| Frontend + API | http://localhost:3000 |
| Adminer (explorador de BD) | http://localhost:8081 |

Credenciales de Adminer: sistema `PostgreSQL`, servidor `db`, usuario `taskmanager`,
contraseña `taskmanager`, base de datos `taskmanager`.

La base de datos se inicializa automáticamente con `init.sql` (incluye datos semilla).

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/users/register` | Registrar usuario |
| POST | `/api/users/login` | Iniciar sesión |
| GET | `/api/users` | Listar usuarios |
| POST | `/api/tasks` | Crear tarea |
| GET | `/api/tasks?status=&assigneeId=` | Listar tareas (con filtros) |
| PATCH | `/api/tasks/:id/status` | Cambiar estado de una tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| GET | `/api/notifications?userId=` | Listar notificaciones |
| PATCH | `/api/notifications/:id/read` | Marcar notificación como leída |

## Estructura del repositorio

```
task-manager/
├── docker-compose.yml
├── init.sql
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── db.ts
│   ├── routes/
│   │   ├── users.routes.ts
│   │   ├── tasks.routes.ts
│   │   └── notifications.routes.ts
│   └── utils/
│       └── helpers.ts
├── public/           # frontend estático
└── docs/adr/          # aquí van los Architecture Decision Records del curso
```

## Para el equipo que lo recibe (ustedes)

Este código funciona y cumple lo que el cliente pidió en su momento. Lo que
encuentren de aquí en adelante —decisiones sin documentar, atajos, acoplamientos—
es material de trabajo, no un error a corregir en silencio. Cada sesión del
módulo les dará una herramienta distinta para diagnosticarlo y decidir, con
evidencia, qué conservar y qué evolucionar.
