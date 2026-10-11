# ---- SevaSetu API (Express + Mongoose) ----
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies first so this layer is cached
# until package.json / package-lock.json actually change.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Run as the unprivileged "node" user that ships with the image.
USER node

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
