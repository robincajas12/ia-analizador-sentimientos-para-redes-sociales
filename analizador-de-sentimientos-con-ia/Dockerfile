# Fase 1: Instalación de dependencias
FROM node:18-alpine AS deps
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Fase 2: Build de la aplicación
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ejecutar el build de Next.js
RUN npm run build

# Fase 3: Ejecución en producción
FROM node:18-alpine AS runner
WORKDIR /app

# Variables de entorno para producción
ENV NODE_ENV=production

# Copiar los archivos de build de la fase anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponer el puerto en el que se ejecuta la aplicación
EXPOSE 9002
EXPOSE 3000
# Comando para iniciar la aplicación
# Usamos "next start -p 9002" para asegurar el puerto
CMD ["npm", "run", "start"]
