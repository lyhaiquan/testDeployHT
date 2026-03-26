# ---- Base Stage ----
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /usr/src/app

# ---- Builder Stage ----
FROM base AS builder
COPY package.json pnpm-lock.yaml .npmrc ./
# Cài đặt toàn bộ để có công cụ build
RUN pnpm install --frozen-lockfile
COPY . .
# Generate Prisma với npx cho chắc chắn
RUN npx prisma generate
RUN pnpm run build
# Xóa devDependencies để giảm dung lượng image
RUN pnpm prune --prod

# ---- Runner Stage ----
FROM base AS runner
ENV NODE_ENV=production
# Copy những thứ thực sự cần thiết
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/package.json ./package.json

USER node
EXPOSE 3000

# Kiểm tra kỹ đường dẫn file main.js của ông nhé
CMD ["node", "dist/src/main.js"]