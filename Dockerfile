# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production backend + serve frontend
FROM python:3.12-slim

WORKDIR /app

# Install backend deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir aiosqlite

# Copy backend code
COPY backend/ ./

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist ./static

# Expose port (Railway uses PORT env var, default 8000)
EXPOSE 8000

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
