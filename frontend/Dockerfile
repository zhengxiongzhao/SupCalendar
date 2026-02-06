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
COPY package*.json ./
RUN npm install --silent --production

EXPOSE 3000

CMD ["npm", "run", "preview"]
