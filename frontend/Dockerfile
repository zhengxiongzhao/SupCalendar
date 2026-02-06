FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json package-lock.json ./
RUN npm install --silent --legacy-peer-deps

COPY src/ src/
COPY public/ public/
COPY index.html vite.config.ts tailwind.config.js tsconfig*.json ./
RUN npm run build --silent

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
RUN npm install --silent --production serve

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
