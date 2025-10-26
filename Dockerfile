# =========================
# Etapa 1: build de Angular
# =========================
FROM node:22-alpine AS build
WORKDIR /app

# copiamos sólo package*.json primero para cachear npm ci
COPY package*.json ./

# install limpio (reproducible)
RUN npm ci

# ahora copiamos el resto del código fuente
COPY . .

# build productivo de Angular
RUN npm run build -- --configuration production

# =========================
# Etapa 2: nginx que sirve el build
# =========================
FROM nginx:alpine

# metemos nuestra config de nginx (la tuya)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copiamos los archivos estáticos generados por Angular al docroot de nginx
# OJO: usamos el nombre exacto que me pasaste
COPY --from=build /app/dist/RestInn-Frontend-Angular/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
