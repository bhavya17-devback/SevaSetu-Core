# ---- SevaSetu web (React build served by nginx) ----

# Stage 1: build the static site
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# "/api" = same address as the website. nginx (below) forwards /api to the
# backend container, so there is no CORS and no hard-coded host.
# NOTE: React bakes this into the build, so changing it needs a rebuild.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Stage 2: tiny nginx image with only the built files
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
