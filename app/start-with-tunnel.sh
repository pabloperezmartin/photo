#!/bin/bash

echo "🚀 Iniciando app con Expo Tunnel (sin necesidad de ngrok)"
echo "========================================================="
echo ""
echo "Expo Tunnel crea un túnel automático que funciona desde cualquier red."
echo "Es más confiable que ngrok para desarrollo móvil."
echo ""

cd /Users/pabloperez/Repositories/photo/app

# Limpiar caché
echo "🧹 Limpiando caché..."
rm -rf .expo node_modules/.cache 2>/dev/null
watchman watch-del-all 2>/dev/null || true

# Matar procesos en puertos
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19000 | xargs kill -9 2>/dev/null || true
lsof -ti:19001 | xargs kill -9 2>/dev/null || true

echo ""
echo "✨ Iniciando Expo con túnel..."
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Espera a que aparezca el código QR"
echo "2. Escanéalo con Expo Go"
echo "3. La primera vez puede tardar un poco más"
echo ""

npx expo start --tunnel --clear
