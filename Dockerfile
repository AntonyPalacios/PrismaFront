# syntax=docker/dockerfile:1

# ---- Build: compile the SPA with Node 22 (no local Node needed) ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# Empty on purpose: the login link becomes relative (/oauth2/authorization/google)
# so it goes through Caddy to the backend on the same origin.
ENV VITE_BACKEND_URL=""
RUN npm run build

# ---- Serve: Caddy serves the static files and proxies the backend ----
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
