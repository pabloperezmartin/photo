# Configuración de la App Móvil

## El error "contenido del código de barras puede ser inválido"

Este error ocurre cuando la app no puede conectarse a la API. Aquí está cómo solucionarlo:

### Solución 1: Usar IP Local (Recomendado)

1. **Obtener tu IP local:**
   ```bash
   # En Mac/Linux:
   ipconfig getifaddr en0
   
   # O ver todas las interfaces:
   ifconfig | grep "inet "
   ```

2. **Actualizar la configuración:**
   - Abre `app/src/config.ts`
   - Asegúrate que `USE_LOCAL = true`
   - Actualiza `LOCAL_IP` con tu IP (actualmente: `192.168.1.39`)

3. **Verificar que ambos dispositivos estén en la misma red WiFi**

4. **Reiniciar la app de Expo:**
   ```bash
   cd app
   npm start
   ```

### Solución 2: Usar ngrok

1. **Iniciar ngrok:**
   ```bash
   ngrok http 4000
   ```

2. **Copiar la URL pública** (ej: `https://xxxx.ngrok-free.dev`)

3. **Actualizar la configuración:**
   - Abre `app/src/config.ts`
   - Cambia `USE_LOCAL = false`
   - Actualiza `NGROK_URL` con tu URL de ngrok

4. **IMPORTANTE:** La primera vez que uses ngrok, debes:
   - Abrir la URL en el navegador del móvil
   - Aceptar la advertencia de ngrok
   - Luego volver a la app

### Verificar que la API funciona

```bash
# Prueba desde tu computadora:
curl http://localhost:4000/

# Prueba desde tu IP local:
curl http://192.168.1.39:4000/

# Resultado esperado:
# {"name":"Catálogo de Libros API","version":"0.1.0",...}
```

### Indicador de Estado

La app ahora muestra un indicador de estado en la parte superior:
- **✅ Conectado (verde)**: La API está accesible
- **❌ Sin conexión (rojo)**: No se puede conectar a la API

### Problemas Comunes

1. **Firewall bloqueando el puerto 4000:**
   - En Mac: System Preferences > Security & Privacy > Firewall
   - Permite conexiones entrantes a Node.js

2. **Docker no está ejecutándose:**
   ```bash
   docker ps  # Debe mostrar catalogo-backend
   ```

3. **IP incorrecta:**
   - La IP puede cambiar si te reconectas al WiFi
   - Verifica con `ipconfig getifaddr en0`

4. **Móvil en otra red:**
   - Asegúrate de estar en la misma red WiFi (no datos móviles)
