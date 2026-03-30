FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:18-alpine

WORKDIR /app

# Required for building better-sqlite3 if prebuilds fail
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.mjs ./

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "server.mjs"]
