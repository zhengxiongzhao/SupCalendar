FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json package-lock.json ./
RUN npm ci --silent

COPY . .
RUN npm run build --silent

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --silent --production

EXPOSE 3000

CMD ["npm", "run", "preview"]
