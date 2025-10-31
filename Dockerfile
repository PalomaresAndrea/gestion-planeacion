# ==============================
# 1️⃣ Build del frontend
# ==============================
FROM node:20-alpine AS frontend-build

# Carpeta de trabajo
WORKDIR /app/frontend

# Copiar package.json y package-lock.json
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el frontend
COPY frontend/ ./

# Build del frontend
RUN npm run build

# ==============================
# 2️⃣ Backend
# ==============================
FROM node:20-alpine AS backend

# Carpeta de trabajo
WORKDIR /app/backend

# Copiar package.json y package-lock.json
COPY backend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el backend
COPY backend/ ./

# Copiar el build del frontend al backend (para servir estáticos)
COPY --from=frontend-build /app/frontend/dist ./public

# Exponer puerto
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["node", "server.js"]
