#!/usr/bin/env bash
# Busca claves en los archivos que se van a versionar. Uso: scripts/check_secrets.sh
# Se ejecuta automáticamente como hook pre-commit (ver scripts/install_hooks.sh).
set -u
cd "$(git rev-parse --show-toplevel)"
PATRON='BEGIN (RSA |EC )?PRIVATE KEY|"private_key"|serviceAccountKey\.json["'"'"' ]*[:=]|license_key *[:=] *["'"'"'][A-Za-z0-9]{20,}|NRAK-[A-Z0-9]{20,}|[A-Fa-f0-9]{36}NRAL'
ARCHIVOS=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null; git ls-files 2>/dev/null)
ARCHIVOS=$(echo "$ARCHIVOS" | sort -u | grep -v '^scripts/check_secrets.sh$' || true)
ERR=0
for f in $ARCHIVOS; do
  [ -f "$f" ] || continue
  case "$f" in
    serviceAccountKey.json|*/serviceAccountKey.json|.env|*/.env|*-firebase-adminsdk-*.json)
      echo "BLOQUEADO: archivo de credenciales versionado: $f"; ERR=1;;
  esac
  if grep -IEn "$PATRON" "$f" >/dev/null 2>&1; then
    echo "BLOQUEADO: posible clave en $f"; grep -IEn "$PATRON" "$f" | sed 's/^/   /' | cut -c1-120; ERR=1
  fi
done
[ $ERR -eq 0 ] && echo "OK: no se detectaron claves en los archivos versionados."
exit $ERR
