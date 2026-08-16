# TrustShare frontend — Vite/React build, served by Nginx.
# Vite bakes VITE_API_URL into the compiled JS at BUILD time (see
# client/src/services/apiClient.js and every featuresApi.js file, which all
# read import.meta.env.VITE_API_URL). That means the API URL must be passed
# as a Docker build ARG, not a runtime environment variable - changing it
# always requires rebuilding this image.

# NOTE: this Dockerfile expects the Docker BUILD CONTEXT to be the project
# ROOT (the folder containing both client/ and nginx/), not the client/
# folder itself, so it can reach nginx/nginx.conf. docker-compose.yml is
# already set up this way (context: ., dockerfile: client/Dockerfile).
# If you build manually, run it from the project root:
#   docker build -f client/Dockerfile -t trustshare-frontend .

# ---- Stage 1: build the static assets ----
FROM node:20-alpine AS build
WORKDIR /app

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/. .

# Passed in from docker-compose.yml / docker build --build-arg
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: serve with Nginx ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
