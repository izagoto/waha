FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG API_GATEWAY_URL=http://api-gateway:3000
ENV API_GATEWAY_URL=$API_GATEWAY_URL
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "run", "start"]
