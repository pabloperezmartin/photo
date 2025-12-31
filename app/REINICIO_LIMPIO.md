# 🔧 Solución definitiva - Reinicio limpio de la app

## El problema identificado:

Expo está usando caché antiguo y la app no está cargando la configuración actualizada que apunta a ngrok.

## ✅ Solución en 2 comandos:

### 1. Ejecuta el script de limpieza:

```bash
cd /Users/pabloperez/Repositories/photo/app
./restart-clean.sh
```

Esto hará:
- ✅ Matar cualquier proceso de Expo corriendo
- ✅ Limpiar toda la caché
- ✅ Iniciar Expo con configuración fresca

### 2. Desde tu móvil:

**Opción A: Escanear de nuevo el QR**
1. Abre Expo Go en tu móvil
2. Escanea el nuevo código QR que aparece en la terminal
3. La app se cargará con la configuración correcta

**Opción B: Recargar la app existente**
1. En Expo Go, agita el móvil para abrir el menú
2. Presiona "Reload"
3. O cierra la app y vuelve a abrirla

## 🔍 Verificación:

Cuando la app cargue correctamente:

1. **Verás en la parte superior:**
   - ✅ **"API: ✅ Conectado" (fondo verde)**
   - La URL: `https://aracely-typological-yolande.ngrok-free.dev`

2. **Si ves "❌ Sin conexión" (rojo):**
   - Lee el mensaje de alerta que aparecerá
   - Te dirá exactamente qué hacer

## 📱 Si el error persiste:

### Verifica la configuración actual:

```bash
# Desde tu computadora, verifica qué URL está usando:
cat /Users/pabloperez/Repositories/photo/app/src/config.ts

# Debe mostrar:
# const USE_LOCAL = false;
# const NGROK_URL = 'https://aracely-typological-yolande.ngrok-free.dev';
```

### Prueba la conexión a ngrok:

```bash
# Esto debe devolver JSON:
curl https://aracely-typological-yolande.ngrok-free.dev/health
```

### Si ngrok cambió de URL:

```bash
# 1. Obtén la URL actual:
curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | cut -d'"' -f4

# 2. Actualiza app/src/config.ts con la nueva URL

# 3. Ejecuta de nuevo:
./restart-clean.sh
```

## 🎯 Resumen del flujo correcto:

```
Docker corriendo → ngrok activo → app/src/config.ts configurado → 
→ Ejecutar ./restart-clean.sh → Escanear QR de nuevo → 
→ Ver indicador verde ✅ → Escanear libros
```

## 💡 Tips:

- **Siempre que cambies `config.ts`, reinicia con `./restart-clean.sh`**
- **La URL de ngrok puede cambiar si reinicias ngrok**
- **El caché de Expo puede causar que los cambios no se reflejen**
- **Si cambias código, presiona 'r' en la terminal de Expo para recargar**

## 🆘 Si aún no funciona:

Prueba con el túnel de Expo en lugar de ngrok:

```bash
cd /Users/pabloperez/Repositories/photo/app

# Edita src/config.ts y cambia a:
# const USE_LOCAL = false;
# const NGROK_URL = 'http://localhost:4000';

# Luego inicia con túnel:
npx expo start --tunnel --clear
```

Esto creará un túnel automático sin necesidad de ngrok.
