
# Catálogo de Libros de Fotografía (MVP)

Proyecto abierto para catalogar libros de fotografía con escaneo de ISBN/EAN, enriquecimiento de metadatos desde fuentes abiertas, gestión mediante dashboard/CRUD, exportación a **CSV**, y soporte **offline** en Web (PWA) y App móvil (Expo).

## Módulos
- **backend/** NestJS + Prisma + PostgreSQL
- **web/** Next.js (PWA) con escaneo y cola offline
- **app/** Expo (React Native) con escaneo y sincronización

## Puesta en marcha (Dev)
1. Crea un fichero `.env` en `backend/` basado en `.env.example`.
2. Levanta servicios con Docker:
```bash
docker-compose up -d --build
```
3. Ejecuta migraciones y semilla:
```bash
docker exec -it catalogo-backend npx prisma migrate deploy
docker exec -it catalogo-backend node -e "require('./dist/prisma/seed.js').seed()"
```
4. Web PWA: http://localhost:3000
5. API: http://localhost:4000

## Licencia
Código bajo **MIT**. Datos del catálogo recomendados bajo **CC BY 4.0**.
