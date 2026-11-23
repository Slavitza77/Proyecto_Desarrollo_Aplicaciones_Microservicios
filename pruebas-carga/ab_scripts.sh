#!/usr/bin/env bash
# Pruebas de carga: 100 peticiones concurrentes contra Django (/api/albumes/) y Node (/health y POST /eventos).
# Usa 'ab' local si existe; si no, el contenedor httpd:2.4 de Docker (que trae ab).
# Uso: ./ab_scripts.sh [TOTAL_PETICIONES] [CONCURRENCIA]
set -euo pipefail
cd "$(dirname "$0")"
TOTAL="${1:-1000}"
CONC="${2:-100}"
DJANGO_URL="${DJANGO_URL:-http://localhost:8000}"
NODE_URL="${NODE_URL:-http://localhost:3000}"
SALIDA="../evidencias"
mkdir -p "$SALIDA"

if command -v ab >/dev/null 2>&1; then
  AB=(ab)
else
  AB=(docker run --rm --network host -v "$PWD:/datos:ro" httpd:2.4 ab)
  DATOS_DIR=/datos
fi
DATOS_DIR="${DATOS_DIR:-$PWD}"

echo '{"usuario_id":"u-carga","track_id":1,"album_id":1,"tipo_evento":"play"}' > evento.json

echo ">>> Django GET /api/albumes/  (n=$TOTAL, c=$CONC)"
"${AB[@]}" -n "$TOTAL" -c "$CONC" "$DJANGO_URL/api/albumes/" | tee "$SALIDA/ab_django_albumes.txt"

echo ">>> Node GET /health  (n=$TOTAL, c=$CONC)"
"${AB[@]}" -n "$TOTAL" -c "$CONC" "$NODE_URL/health" | tee "$SALIDA/ab_node_health.txt"

echo ">>> Node POST /eventos  (n=$TOTAL, c=$CONC)"
"${AB[@]}" -n "$TOTAL" -c "$CONC" -p "$DATOS_DIR/evento.json" -T application/json "$NODE_URL/eventos" | tee "$SALIDA/ab_node_eventos.txt"
