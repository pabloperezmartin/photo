#!/bin/bash

echo "🧹 Limpiando caché de Expo..."
cd /Users/pabloperez/Repositories/photo/app

# Matar proceso en puerto 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Limpiar caché
rm -rf .expo node_modules/.cache 
watchman watch-del-all 2>/dev/null || true

echo ""
echo "🚀 Iniciando Expo con caché limpia..."
echo ""
echo "⚠️  IMPORTANTE: Después de que inicie:"
echo "1. Escanea el código QR de nuevo desde tu móvil"
echo "2. O presiona 'r' para recargar la app"
echo ""

npx expo start --clear
