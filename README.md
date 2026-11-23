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
