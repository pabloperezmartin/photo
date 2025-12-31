#!/bin/bash

echo "🚀 INICIO SIMPLE - Todo en uno"
echo "=============================="
echo ""

cd /Users/pabloperez/Repositories/photo/app

# Matar procesos
echo "🧹 Limpiando procesos..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
rm -rf .expo 2>/dev/null

# Verificar ngrok
echo ""
echo "🔍 Verificando ngrok..."
if curl -s http://127.0.0.1:4040/api/tunnels | grep -q "public_url"; then
  NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✅ ngrok activo: $NGROK_URL"
else
  echo "❌ ngrok NO está corriendo"
  echo "   Ejecuta en otra terminal: ngrok http 4000"
  exit 1
fi

# Verificar Docker
echo ""
echo "🔍 Verificando Docker..."
if docker ps | grep -q catalogo-backend; then
  echo "✅ Docker backend corriendo"
else
  echo "❌ Docker NO está corriendo"
  echo "   Ejecuta: docker-compose up -d"
  exit 1
fi

# Probar API
echo ""
echo "🔍 Probando API..."
if curl -s -H "ngrok-skip-browser-warning: true" "$NGROK_URL/health" | grep -q "ok"; then
  echo "✅ API responde correctamente"
else
  echo "⚠️  API no responde, pero continuando..."
fi

echo ""
echo "==============================="
echo "✨ TODO LISTO - Iniciando Expo"
echo "==============================="
echo ""
echo "📱 PASOS EN TU MÓVIL:"
echo "1. Abre Expo Go"
echo "2. Escanea el QR que aparecerá"
echo "3. SI ves error de conexión:"
echo "   a) Abre Safari en el móvil"
echo "   b) Ve a: $NGROK_URL"
echo "   c) Acepta la advertencia"
echo "   d) Vuelve a Expo Go y recarga"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

npm start
