# ✅ Solución al error "contenido del código de barras puede ser inválido"

## El problema
El firewall de macOS está bloqueando las conexiones entrantes desde la red local hacia el puerto 4000.

## ✅ Solución aplicada: usar ngrok

La app ahora está configurada para usar ngrok, que crea un túnel público hacia tu API local.

### Estado actual:
- ✅ ngrok activo en: `https://aracely-typological-yolande.ngrok-free.dev`
- ✅ App configurada para usar ngrok (`USE_LOCAL = false`)
- ✅ Indicador de estado añadido a la app

### Pasos para usar la app en tu móvil:

1. **Asegúrate de que ngrok esté corriendo:**
   ```bash
   # Si no está activo, ejecuta:
   ngrok http 4000
   ```

2. **Reinicia la app de Expo en tu móvil:**
   - Cierra completamente la app de Expo Go
   - Vuelve a escanear el código QR
   - O usa el menú de Expo: "Reload"

3. **Primera vez con ngrok:**
   - Si ves una advertencia de ngrok en el móvil, acepta/continúa
   - Esto solo sucede la primera vez

4. **Verifica la conexión:**
   - La app mostrará **✅ Conectado (verde)** si todo está bien
   - Si muestra **❌ Sin conexión (rojo)**, revisa que ngrok esté activo

### Comandos útiles:

```bash
# Ver estado de la API
./check-api.sh

# Ver logs del backend
docker logs catalogo-backend --tail=50

# Reiniciar todo
docker-compose restart

# Ver URL de ngrok
curl http://127.0.0.1:4040/api/tunnels | grep public_url
```

### Si ngrok se desconecta:

La URL de ngrok puede cambiar si reinicias ngrok. Si eso pasa:

1. Obtén la nueva URL: `curl http://127.0.0.1:4040/api/tunnels | grep public_url`
2. Actualiza `app/src/config.ts` con la nueva `NGROK_URL`
3. Reinicia la app

### Alternativa: Desactivar el Firewall (NO recomendado)

Si prefieres no usar ngrok:

1. Ve a: System Preferences > Security & Privacy > Firewall
2. Desactiva el Firewall o permite conexiones a Docker
3. En `app/src/config.ts` cambia `USE_LOCAL = true`
4. Reinicia la app

## Mejoras añadidas:

1. ✅ **Indicador de estado** - La app muestra si está conectada a la API
2. ✅ **Mejores mensajes de error** - Errores más descriptivos
3. ✅ **Verificación al inicio** - La app comprueba la conexión al arrancar
4. ✅ **Script de diagnóstico** - `check-api.sh` para verificar la conectividad
5. ✅ **Endpoint /health** - Para verificar que la API funciona

## Archivo de configuración

Revisa y modifica según necesites: [app/src/config.ts](app/src/config.ts)
