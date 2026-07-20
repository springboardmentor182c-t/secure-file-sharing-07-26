FROM node:22-alpine AS frontend-build

WORKDIR /frontend
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./

# An empty API URL makes browser requests use the same origin as FastAPI.
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=${REACT_APP_API_URL} \
    GENERATE_SOURCEMAP=false
RUN npm run build


FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    FRONTEND_DIST_DIR=/app/client/build

WORKDIR /app/server

COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ ./
COPY --from=frontend-build /frontend/build /app/client/build

EXPOSE 8000

CMD ["sh", "-c", "uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
