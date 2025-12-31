# 📱 Pasos para conectar la app móvil

## ⚠️ IMPORTANTE: Lee esto antes de usar la app

### El problema de ngrok
Ngrok muestra una página de advertencia la primera vez que accedes desde un navegador/app. Esto es normal y esperado.

## ✅ Solución en 3 pasos:

### Paso 1: Verifica que todo esté corriendo
```bash
# En tu terminal, asegúrate de que estos servicios estén activos:

# 1. Docker (backend)
docker ps | grep catalogo-backend
# Debe mostrar: catalogo-backend

# 2. ngrok
curl http://127.0.0.1:4040/api/tunnels
# Debe mostrar la URL pública

# 3. Obtén la URL de ngrok
curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1
# Ejemplo: "public_url":"https://aracely-typological-yolande.ngrok-free.dev"
```

### Paso 2: Abre la URL de ngrok en el navegador del móvil PRIMERO

**🔴 ESTE PASO ES CRÍTICO**

1. **Copia la URL de ngrok** (por ejemplo: `https://aracely-typological-yolande.ngrok-free.dev`)
2. **Envíatela por WhatsApp, email, o AirDrop**
3. **Ábrela en Safari o Chrome en tu móvil**
4. **Verás una página de advertencia de ngrok**
5. **Haz clic en "Visit Site"**
6. **Deberías ver un JSON como este:**
   ```json
   {
     "name":"Catálogo de Libros API",
     "version":"0.1.0",
     "status":"running",
     "endpoints":{...}
   }
   ```

### Paso 3: Ahora sí, abre la app

1. **Asegúrate de que `app/src/config.ts` tenga:**
   ```typescript
   const USE_LOCAL = false;
   const NGROK_URL = 'https://tu-url-ngrok-actual.ngrok-free.dev';
   ```

2. **Reinicia la app de Expo:**
   ```bash
   cd app
   npm start
   ```

3. **Escanea el QR code con Expo Go**

4. **La app mostrará:**
   - ✅ **Conectado (verde)** si funciona
   - ❌ **Sin conexión (rojo)** si hay un problema

## 🔍 Si aún no funciona:

### Verifica en la terminal de la app:
Mira los logs de Metro bundler (donde corriste `npm start`):
- Busca mensajes de error
- Busca "Conectando a:"

### Prueba manualmente la API:
```bash
# Desde tu computadora
curl https://tu-url-ngrok.ngrok-free.dev/health

# Resultado esperado:
# {"status":"ok","timestamp":"2025-12-31T..."}
```

### Si ngrok cambió de URL:
Ngrok puede cambiar de URL si lo reinicias. Si eso pasa:

```bash
# 1. Obtén la nueva URL
curl -s http://127.0.0.1:4040/api/tunnels | grep public_url

# 2. Actualiza app/src/config.ts con la nueva URL

# 3. Reinicia la app
```

## 🆘 Alternativas si ngrok no funciona:

### Opción A: Usa Expo Tunnel
```bash
cd app
npx expo start --tunnel
```
Esto crea un túnel automático sin necesidad de ngrok.

### Opción B: Desactiva el Firewall (temporal)
1. System Preferences > Security & Privacy > Firewall
2. Desactiva temporalmente el Firewall
3. Cambia en `app/src/config.ts`: `USE_LOCAL = true`
4. Reinicia la app

## 📞 La app ahora te ayuda

Cuando abras la app, verás mensajes claros:
- Si no puede conectarse, te dirá exactamente qué hacer
- Si detecta que es ngrok, te pedirá abrir la URL en el navegador primero
- El indicador verde/rojo te muestra el estado en tiempo real

## ✨ Confirmación de que funciona:

Cuando todo esté bien configurado:
1. ✅ Verás el indicador VERDE en la app
2. ✅ Podrás escanear códigos de barras
3. ✅ Los libros se guardarán correctamente

## 🐛 Debug adicional:

Si sigues con problemas, envíame:
```bash
# Logs del backend
docker logs catalogo-backend --tail=50

# Estado de ngrok
curl http://127.0.0.1:4040/api/tunnels

# Prueba desde el móvil (en Safari)
# Abre: https://tu-url-ngrok.ngrok-free.dev/health
```
