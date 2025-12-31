
FROM node:20-alpine AS builder
WORKDIR /app
# Copiamos solo manifest para instalar deps primero (aprovecha cache)
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
# Instala dependencias; si no hay lock usa npm install
RUN npm ci || npm install
# Copiamos el resto del código
COPY . .
# Construimos el proyecto
RUN npm run build

# --- Runtime más ligero ---
FROM node:20-alpine
WORKDIR /app
# Copiamos sólo lo necesario para ejecutar
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
# Instalamos sólo deps de runtime (omitimos devDependencies)
RUN npm install --omit=dev
# Etapa final: imagen ligera para correr la app
EXPOSE 4000
CMD ["node", "dist/main.js"]
