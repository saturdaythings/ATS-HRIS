# V.Two Ops — Multi-stage Production Dockerfile
# Build: docker build -t vtwo-ops:latest .
# Run:   docker run -d -p 3001:3001 --env-file .env.production -v vtwo-ops-data:/app/prisma vtwo-ops:latest

# ----------------------------------------------------------
# Stage 1: Build (includes devDependencies for vite build)
# ----------------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests first for layer caching.
COPY package*.json ./
COPY app/package*.json ./app/

# Copy Prisma schema for client generation.
COPY prisma ./prisma

# Install all dependencies (dev included — needed for vite).
RUN npm ci && cd app && npm ci

# Copy remaining source.
COPY . .

# Generate Prisma client and initialize the database schema.
RUN npx prisma generate && npx prisma db push

# Build the React frontend (outputs to app/dist/).
RUN npm run build

# ----------------------------------------------------------
# Stage 2: Production (minimal image)
# ----------------------------------------------------------
FROM node:18-alpine

WORKDIR /app

# Production dependencies only.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

# Copy built frontend from Stage 1.
COPY --from=build /app/app/dist ./app/dist

# Copy server source.
COPY server ./server

# Default port (override with PORT env var).
EXPOSE 3001

CMD ["node", "server/index.js"]
