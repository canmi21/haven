FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g npm@11.2.0 pnpm && pnpm install

COPY . .
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN npm install -g npm@11.2.0 pnpm && pnpm install --prod

CMD ["node", "dist/main.js"]

EXPOSE 33321