FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server/package*.json server/
RUN cd server && npm install
COPY . .
RUN npm run build:all

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
EXPOSE 3001
CMD ["node", "server/index.js"]
