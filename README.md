# LoL Hub

Aplicación web completa (frontend y backend) basada en League of Legends. Los jugadores pueden registrarse, crear configuraciones de campeones (objetos, runas, dificultad y versión del juego), editarlas y eliminarlas, además de guardar como favoritas las configuraciones creadas por otros jugadores.

- **Frontend:** Angular 22 + Angular Material (carpeta `frontend/`)
- **Backend:** FastAPI + SQLAlchemy 2 (carpeta `backend/`)
- **Base de datos:** PostgreSQL (MySQL también soportado cambiando la URL)
- **Autenticación:** JWT, contraseñas con bcrypt

## Funcionalidades

- Registro, inicio y cierre de sesión con JWT.
- CRUD completo de **builds** (crear, listar, ver detalle, editar, eliminar). Solo el autor puede editar o borrar.
- Catálogo de 50 campeones con búsqueda y filtro por rol (se carga solo al iniciar el backend).
- Favoritos (relación muchos a muchos entre usuarios y builds).
- Filtros de builds: texto, rol, campeón, "mis builds" y "favoritas".
- Panel de inicio con estadísticas: builds por rol, campeones más armados, conteos personales.
- Diseño responsive (menú lateral que se oculta en móvil).

## Requisitos

- Node.js 20+ y npm
- Python 3.11+
- PostgreSQL 14+ (o MySQL 8+)

## 1. Base de datos

Crear una base vacía llamada `lolhub`. Las tablas se crean solas al iniciar el backend.

PostgreSQL local:

```bash
psql -U postgres -c "CREATE DATABASE lolhub;"
```

Con Docker (reemplaza `TU_CLAVE` por la que quieras, no la subas al repositorio):

```bash
docker run --name lolhub-db -e POSTGRES_PASSWORD=TU_CLAVE -e POSTGRES_DB=lolhub -p 5432:5432 -d postgres:16
```

MySQL (alternativa): `CREATE DATABASE lolhub CHARACTER SET utf8mb4;` y usar la URL `mysql+pymysql://...` en el paso siguiente.

## 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # Windows: copy .env.example .env
```

Editar `.env`:

- `DATABASE_URL`: usuario, clave y base de datos que creaste.
- `JWT_SECRET`: generar uno con
  `python -c "import secrets; print(secrets.token_urlsafe(48))"`

Iniciar el servidor:

```bash
uvicorn main:app --reload --port 8000
```

La API queda en http://localhost:8000 y la documentación interactiva en http://localhost:8000/docs.

## 3. Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación abre en http://localhost:4200. Si el backend corre en otra dirección, cambiar `apiUrl` en `frontend/src/environments/environment.ts` (y `CORS_ORIGINS` en el `.env` del backend si el frontend cambia de puerto).

## Endpoints principales

| Método | Ruta | Descripción | Requiere JWT |
|---|---|---|---|
| POST | `/auth/register` | Crear cuenta | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/me` | Usuario actual | Sí |
| GET | `/champions` | Listar campeones (`search`, `role`) | Sí |
| GET | `/builds` | Listar builds (`search`, `role`, `champion_id`, `mine`, `only_favorites`) | Sí |
| GET | `/builds/{id}` | Detalle | Sí |
| POST | `/builds` | Crear | Sí |
| PUT | `/builds/{id}` | Editar (solo autor) | Sí |
| DELETE | `/builds/{id}` | Eliminar (solo autor) | Sí |
| POST / DELETE | `/builds/{id}/favorite` | Agregar / quitar favorita | Sí |
| GET | `/stats` | Estadísticas del panel | Sí |

## Modelo de datos

```
users (id, username, email, hashed_password, created_at)
champions (id, name, title, role, region, image_key)
builds (id, title, description, role, items[json], runes, difficulty, patch,
        champion_id -> champions, user_id -> users, created_at, updated_at)
favorites (user_id -> users, build_id -> builds)      # muchos a muchos
```

## Estructura

```
backend/
  main.py            arranque, CORS, routers
  core/              configuración, seguridad (bcrypt/JWT), dependencia de usuario actual
  database/          conexión SQLAlchemy y seed de campeones
  models/            tablas (ORM)
  schemas/           validación de entrada/salida (Pydantic)
  routers/           auth, champions, builds, stats
frontend/src/app/
  components/        avatar, tarjeta de build, diálogos, estados vacío/carga
  core/              modelos, servicios HTTP, utilidades
  guards/            authGuard y guestGuard
  interceptors/      authInterceptor (agrega el JWT) y errorInterceptor (401)
  layout/            toolbar + sidenav
  pages/             login, registro, inicio, campeones, builds, detalle, 404
```

## Seguridad

- Las contraseñas se guardan con bcrypt, nunca en texto plano.
- El `.env` está en `.gitignore`; el repositorio solo incluye `.env.example` sin valores reales.
- Los endpoints (salvo registro y login) exigen JWT, y editar/eliminar builds verifica que el usuario sea el autor.

