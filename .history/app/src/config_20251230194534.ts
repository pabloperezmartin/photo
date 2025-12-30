
// Configuración de la API para la app móvil
// Cambia esta URL por la IP local de tu PC al desarrollar en red:
// Ejemplo: export const API_BASE = 'http://192.168.1.23:4000';
// Por defecto, usa localhost (útil en emuladores Android con redir. o túnel):
export const API_BASE = process.env.API_BASE || 'http://localhost:4000';
