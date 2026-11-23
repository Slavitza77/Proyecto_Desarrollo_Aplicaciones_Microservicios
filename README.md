# Microservicios: streaming y telemetría en tiempo real

Prototipo de sistema distribuido con persistencia independiente por servicio (Database-per-Service).
Curso: Desarrollo de Aplicaciones, UCSM, Ingeniería de Sistemas.

| Servicio | Tecnología | Base de datos | Carpeta |
|---|---|---|---|
| Catálogo | Django REST Framework | SQLite | `catalogo-django/` |
| Eventos y usuarios | Node.js + firebase-admin | Cloud Firestore | `eventos-node/` |
| Observabilidad | New Relic (APM + infraestructura) | New Relic One | `eventos-node/`, `pruebas-carga/` |

**Ninguna credencial se versiona.** `serviceAccountKey.json`, `.env` y `newrelic_agent.log` están en `.gitignore`.
Antes de cada commit se ejecuta `scripts/check_secrets.sh` (instalar el hook con `scripts/install_hooks.sh`).

## Catálogo (Django REST)

```bash
cd catalogo-django
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

Endpoints: `http://localhost:8000/api/albumes/` y `http://localhost:8000/api/tracks/` (CRUD completo).
Pruebas: `python manage.py test`.

## Eventos y usuarios (Node.js + Firestore)

Esquema de Firestore: colección `eventos_reproduccion` con los campos `usuario_id`, `track_id`, `album_id`, `tipo_evento` y `fecha` (marca de tiempo del servidor).
Las reglas (`eventos-node/firestore.rules`) deniegan todo acceso de cliente; solo escribe el SDK Admin.

```bash
cd eventos-node
npm install
cp .env.example .env        # completar con valores propios; .env no se versiona
set -a; . ./.env; set +a
npm start                   # node -r newrelic index.js
```

Pruebas sin cuenta de Firebase (emulador de Firestore en Docker):

```bash
docker run -d --name firestore-emu --network host google/cloud-sdk:emulators \
  gcloud emulators firestore start --host-port=127.0.0.1:8080
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-microservicios npm run start:sin-apm
```

Endpoints: `GET /health`, `POST /eventos`, `GET /eventos`.

## Pruebas de carga

`pruebas-carga/ab_scripts.sh` lanza peticiones concurrentes con `ab` (local o vía Docker `httpd:2.4`) y guarda la salida en `evidencias/`.
También se incluye `pruebas-carga/postman_collection.json`.
