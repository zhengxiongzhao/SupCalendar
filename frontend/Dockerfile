FROM node:20-alpine AS builder

WORKDIR /app

# ARG allows passing VITE_API_URL at build time for Vite env variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-/api}

COPY package*.json package-lock.json ./
RUN npm install --silent --legacy-peer-deps

COPY src/ src/
COPY public/ public/
COPY index.html vite.config.ts postcss.config.js tsconfig*.json ./
RUN npm run build --silent

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
RUN npm install --silent --production serve

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
