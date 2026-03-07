FROM nginx:1.25-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Eliminar config default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuracion personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost/ || exit 1
