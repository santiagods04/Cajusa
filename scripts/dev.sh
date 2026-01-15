#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  echo -e "\n🧹 Deteniendo servicios..."
  # intentar terminar con SIGINT; ignorar errores si ya murieron
  kill "$BACK_PID" 2>/dev/null || true
  kill "$FRONT_PID" 2>/dev/null || true
  # dar un tiempito y forzar si quedaron zombies
  sleep 0.5
  kill -9 "$BACK_PID" 2>/dev/null || true
  kill -9 "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Opcional: liberar puertos si quedaron ocupados
if [[ "${KILL_PORTS:-1}" == "1" ]]; then
  npx --yes kill-port 3000 5173 >/dev/null 2>&1 || true
fi

# Lanzar backend y frontend en paralelo
( cd "$ROOT_DIR/Cajusa-backend"  && npm run dev ) & BACK_PID=$!
( cd "$ROOT_DIR/Cajusa-frontend" && npm run dev ) & FRONT_PID=$!

echo "🚀 Backend PID: $BACK_PID | Frontend PID: $FRONT_PID"
echo "🛑 Presiona Ctrl+C para detener ambos"

# Esperar a que uno termine; si uno muere, apagamos el otro
while kill -0 "$BACK_PID" 2>/dev/null && kill -0 "$FRONT_PID" 2>/dev/null; do
  sleep 1
done

cleanup
