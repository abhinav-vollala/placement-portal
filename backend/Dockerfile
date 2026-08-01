# ---- Stage 1: install all dependencies (devDeps included, for building) ----
FROM node:22-slim AS deps
WORKDIR /app
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: generate Prisma client + compile TypeScript ----
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build
# tsc does not copy the native query engine binary — move it where dist expects it.
RUN cp src/generated/prisma/*.node dist/generated/prisma/

# ---- Stage 3: minimal runtime image ----
FROM node:22-slim AS prod
WORKDIR /app
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
COPY --from=deps /app/package.json /app/package-lock.json ./
RUN npm ci
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# The whole src/ tree is copied so the seed script (run via `tsx prisma/seed.ts`)
# can resolve its `../src/...` imports, exactly as in development.
COPY --from=build /app/src ./src
EXPOSE 4000
# Migrations are applied before the app starts (see docker-compose.prod.yml).
CMD ["node", "dist/index.js"]
