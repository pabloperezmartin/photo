#!/bin/bash

echo "🔍 Diagnóstico de conectividad de la API"
echo "========================================"
echo ""

# Verificar Docker
echo "1. Estado de Docker:"
if docker ps | grep -q catalogo-backend; then
  echo "✅ Docker backend está corriendo"
else
  echo "❌ Docker backend NO está corriendo"
  echo "   Ejecuta: docker-compose up -d"
  exit 1
fi
echo ""

# Verificar localhost
echo "2. Probando localhost:4000:"
if curl -s http://localhost:4000/ > /dev/null; then
  echo "✅ API responde en localhost"
else
  echo "❌ API NO responde en localhost"
  exit 1
fi
echo ""

# Obtener IP local
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
echo "3. Tu IP local es: $IP"
echo ""

# Probar IP local
echo "4. Probando desde IP local ($IP:4000):"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://$IP:4000/ 2>&1)
if [ "$RESPONSE" = "200" ]; then
  echo "✅ API accesible desde IP local"
else
  echo "⚠️  API NO accesible desde IP local (código: $RESPONSE)"
  echo ""
  echo "💡 Posibles soluciones:"
  echo "   1. Verifica tu Firewall de macOS:"
  echo "      System Preferences > Security & Privacy > Firewall"
  echo "      Permite conexiones entrantes a Docker/Node.js"
  echo ""
  echo "   2. Usa ngrok como alternativa:"
  echo "      ngrok http 4000"
  echo "      Copia la URL y actualiza app/src/config.ts"
  echo ""
  echo "   3. Prueba reiniciar Docker:"
  echo "      docker-compose down && docker-compose up -d"
fi
echo ""

# Verificar ngrok
echo "5. Verificando ngrok:"
if curl -s http://127.0.0.1:4040/api/tunnels > /dev/null 2>&1; then
  NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -n "$NGROK_URL" ]; then
    echo "✅ ngrok activo: $NGROK_URL"
    echo "   Actualiza app/src/config.ts con esta URL si usas ngrok"
  fi
else
  echo "ℹ️  ngrok no está corriendo"
  echo "   Para iniciarlo: ngrok http 4000"
fi
echo ""

echo "📱 Para conectar desde el móvil:"
echo "   1. Asegúrate de estar en la misma red WiFi"
echo "   2. Actualiza app/src/config.ts con:"
echo "      - USE_LOCAL = true y LOCAL_IP = '$IP' (recomendado)"
echo "      - O USE_LOCAL = false y NGROK_URL con tu URL de ngrok"
echo "   3. Reinicia la app de Expo: npm start"
