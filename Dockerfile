# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: serve con Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Se copia como .template para que envsubst lo procese al arrancar
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

EXPOSE 80

# Solo sustituye ${BACKEND_URL}; las variables nginx ($uri, $host, etc.) quedan intactas
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
