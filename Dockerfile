# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache wget && npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 8043

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --spider -q http://localhost:8043/ || exit 1

CMD ["serve", "-s", "dist", "-l", "8043"]