FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl bash && \
    npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY . .

RUN pnpm run build

CMD ["node", "dist/main.js"]

EXPOSE 33321
