#!/bin/bash

NGROK_URL="https://aracely-typological-yolande.ngrok-free.dev"

echo "🧪 Simulando conexión de la app móvil"
echo "======================================"
echo ""
echo "URL: $NGROK_URL"
echo ""

echo "1️⃣ Probando /health (como hace la app al iniciar):"
echo "------------------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP Code: %{http_code}\nContent-Type: %{content_type}" \
  -H "ngrok-skip-browser-warning: true" \
  "$NGROK_URL/health")

echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "text/html"; then
  echo "❌ PROBLEMA: ngrok devuelve HTML (página de advertencia)"
  echo ""
  echo "🔧 SOLUCIÓN:"
  echo "1. Abre esta URL en el navegador de tu móvil:"
  echo "   $NGROK_URL"
  echo ""
  echo "2. Acepta la advertencia de ngrok"
  echo ""
  echo "3. Deberías ver JSON, no una página web"
  echo ""
  echo "4. Luego vuelve a la app"
  exit 1
fi

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
  echo "✅ La API responde correctamente"
  echo ""
  echo "2️⃣ Probando /ingest/isbn (como cuando escaneas un libro):"
  echo "--------------------------------------------------------"
  
  TEST_RESPONSE=$(curl -s -w "\nHTTP Code: %{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "ngrok-skip-browser-warning: true" \
    -d '{"isbn13":"9780134685991"}' \
    "$NGROK_URL/ingest/isbn")
  
  echo "$TEST_RESPONSE"
  echo ""
  
  if echo "$TEST_RESPONSE" | grep -q "HTTP Code: 2"; then
    echo "✅ Todo funciona correctamente!"
    echo ""
    echo "📱 La app debería funcionar sin problemas"
    echo ""
    echo "Próximos pasos:"
    echo "1. Reinicia la app de Expo (cierra y vuelve a abrir)"
    echo "2. Verás el indicador VERDE si está conectado"
    echo "3. Ya puedes escanear códigos de barras"
  else
    echo "⚠️ La API responde pero hay un error"
    echo "Revisa los logs: docker logs catalogo-backend --tail=20"
  fi
else
  echo "❌ PROBLEMA: La API no responde correctamente"
  echo ""
  echo "Verifica:"
  echo "1. Docker está corriendo: docker ps | grep catalogo-backend"
  echo "2. ngrok está activo: curl http://127.0.0.1:4040/api/tunnels"
fi

echo ""
echo "💡 Si ves HTML en lugar de JSON, DEBES abrir $NGROK_URL"
echo "   en el navegador del móvil ANTES de usar la app"
