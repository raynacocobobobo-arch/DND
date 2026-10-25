FROM node:22-bookworm-slim AS build

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/data/hermestodo.sqlite
WORKDIR /app

COPY --from=build /build/package.json /build/package-lock.json ./
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
COPY --from=build /build/scripts ./scripts

RUN mkdir -p /app/data /app/backups && chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "dist/server/index.js"]
