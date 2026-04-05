#!/bin/bash
# Relay para conectar iPhone (Admin) → Android emulador (Worker) via LAN
# Uso: ./scripts/lan-relay.sh
# Se encarga de todo automáticamente: limpia procesos viejos, espera al emulador,
# hace adb forward, lanza socat, y se recupera si algo falla.

PORT=9847
MAX_ADB_WAIT=60        # segundos máximo esperando al emulador
HEALTH_INTERVAL=5      # segundos entre health checks

# ── Colores ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Cleanup al salir ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  [ -n "$SOCAT_PID" ] && kill $SOCAT_PID 2>/dev/null
  [ -n "$HEALTH_PID" ] && kill $HEALTH_PID 2>/dev/null
  adb forward --remove tcp:$PORT 2>/dev/null
  # Matar cualquier socat huérfano en nuestro puerto
  pkill -f "socat.*TCP-LISTEN:$PORT" 2>/dev/null
  echo -e "${RED}🛑 Relay detenido${NC}"
  exit 0
}
trap cleanup INT TERM EXIT

# ── 1. Detectar IP local ────────────────────────────────────────────────────
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep -v "169.254" | awk '{print $2}' | head -1)
if [ -z "$IP" ]; then
  echo -e "${RED}❌ No se encontró IP local${NC}"
  exit 1
fi
echo -e "${CYAN}📡 IP local: $IP${NC}"

# ── 2. Limpiar todo lo viejo ────────────────────────────────────────────────
echo -e "${YELLOW}🧹 Limpiando procesos anteriores...${NC}"
pkill -f "socat.*TCP-LISTEN:$PORT" 2>/dev/null
# Liberar el puerto si algo lo tiene ocupado
lsof -ti tcp:$PORT 2>/dev/null | xargs kill -9 2>/dev/null
adb forward --remove tcp:$PORT 2>/dev/null
sleep 0.5

# ── 3. Esperar a que adb detecte un dispositivo ─────────────────────────────
echo -e "${YELLOW}⏳ Esperando emulador Android...${NC}"
WAITED=0
while ! adb devices 2>/dev/null | grep -q "device$"; do
  if [ $WAITED -ge $MAX_ADB_WAIT ]; then
    echo -e "${RED}❌ Timeout: no se encontró emulador después de ${MAX_ADB_WAIT}s${NC}"
    echo -e "${YELLOW}   Asegúrate de que el emulador esté corriendo${NC}"
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
  echo -ne "\r${YELLOW}⏳ Esperando emulador... ${WAITED}s${NC}  "
done
echo ""
DEVICE=$(adb devices | grep "device$" | head -1 | awk '{print $1}')
echo -e "${GREEN}✅ Emulador encontrado: $DEVICE${NC}"

# ── 4. adb forward ──────────────────────────────────────────────────────────
setup_forward() {
  adb forward --remove tcp:$PORT 2>/dev/null
  if adb forward tcp:$PORT tcp:$PORT 2>/dev/null; then
    echo -e "${GREEN}✅ adb forward tcp:$PORT → emulador${NC}"
    return 0
  else
    echo -e "${RED}❌ Error en adb forward${NC}"
    return 1
  fi
}

setup_forward || exit 1

# ── 5. Esperar a que el Worker escuche en el puerto ──────────────────────────
echo -e "${YELLOW}⏳ Esperando a que Worker abra el puerto $PORT...${NC}"
PORT_WAIT=0
while ! nc -z 127.0.0.1 $PORT 2>/dev/null; do
  if [ $PORT_WAIT -ge 30 ]; then
    echo -e "${RED}❌ Worker no abrió el puerto $PORT después de 30s${NC}"
    echo -e "${YELLOW}   Asegúrate de que la app Worker esté corriendo${NC}"
    exit 1
  fi
  sleep 1
  PORT_WAIT=$((PORT_WAIT + 1))
  echo -ne "\r${YELLOW}⏳ Esperando Worker... ${PORT_WAIT}s${NC}  "
done
echo ""
echo -e "${GREEN}✅ Worker escuchando en puerto $PORT${NC}"

# ── 6. Iniciar socat relay ──────────────────────────────────────────────────
start_socat() {
  pkill -f "socat.*TCP-LISTEN:$PORT" 2>/dev/null
  sleep 0.3
  socat TCP-LISTEN:$PORT,bind=$IP,reuseaddr,fork TCP:127.0.0.1:$PORT &
  SOCAT_PID=$!
  echo -e "${GREEN}✅ socat relay $IP:$PORT → 127.0.0.1:$PORT (PID $SOCAT_PID)${NC}"
}

start_socat

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📱 En tu iPhone pega esta IP: ${GREEN}$IP${NC}"
echo -e "${CYAN}     Puerto $PORT se agrega automáticamente${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener el relay${NC}"
echo -e "${YELLOW}Health check cada ${HEALTH_INTERVAL}s — se recupera solo si algo falla${NC}"
echo ""

# ── 7. Health check loop ────────────────────────────────────────────────────
(
  FAIL_COUNT=0
  while true; do
    sleep $HEALTH_INTERVAL

    # Verificar que adb siga conectado
    if ! adb devices 2>/dev/null | grep -q "device$"; then
      echo -e "\n${RED}⚠️  Emulador desconectado — esperando...${NC}"
      while ! adb devices 2>/dev/null | grep -q "device$"; do
        sleep 2
      done
      echo -e "${GREEN}✅ Emulador reconectado${NC}"
      setup_forward
      # Esperar a Worker
      while ! nc -z 127.0.0.1 $PORT 2>/dev/null; do sleep 1; done
      echo -e "${GREEN}✅ Worker reconectado${NC}"
      start_socat
      FAIL_COUNT=0
      continue
    fi

    # Verificar que adb forward siga activo
    if ! adb forward --list 2>/dev/null | grep -q "$PORT"; then
      echo -e "\n${YELLOW}🔄 adb forward perdido, recreando...${NC}"
      setup_forward
      FAIL_COUNT=0
      continue
    fi

    # Verificar que el Worker siga escuchando
    if ! nc -z 127.0.0.1 $PORT 2>/dev/null; then
      FAIL_COUNT=$((FAIL_COUNT + 1))
      if [ $FAIL_COUNT -ge 3 ]; then
        echo -e "\n${YELLOW}🔄 Worker no responde, refrescando forward...${NC}"
        setup_forward
        FAIL_COUNT=0
      fi
      continue
    fi

    # Verificar que socat siga vivo
    if ! kill -0 $SOCAT_PID 2>/dev/null; then
      echo -e "\n${YELLOW}🔄 socat murió, reiniciando...${NC}"
      start_socat
    fi

    FAIL_COUNT=0
  done
) &
HEALTH_PID=$!

# Esperar a que termine (solo por Ctrl+C)
wait $SOCAT_PID 2>/dev/null
