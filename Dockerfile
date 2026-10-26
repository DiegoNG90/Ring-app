FROM node:22.23.4-bookworm

WORKDIR /app

# better-sqlite3 compiles a native addon. The full bookworm image already
# includes a toolchain; these packages keep that requirement explicit.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Lockfile is version 9. pnpm 10 reads it. Pin the version so the image
# does not float to whatever Corepack considers latest.
RUN npm install -g pnpm@10.26.1

COPY package.json pnpm-lock.yaml ./

# Railway injects NODE_ENV=production while building the image. Without
# this flag, pnpm skips devDependencies and `next build` cannot find
# TypeScript or Tailwind.
RUN pnpm install --frozen-lockfile --config.production=false

COPY . .

ENV NODE_ENV=production

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
