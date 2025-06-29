########################
# 1. Builder stage
########################
FROM node:22.16-alpine AS builder

WORKDIR /home/app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

########################
# 2. Production stage
########################
FROM node:22.16-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder home/app/dist ./dist
COPY docs ./docs 
COPY scripts/wait-for.sh /usr/local/bin/wait-for
RUN chmod +x /usr/local/bin/wait-for

CMD ["sh", "-c", "wait-for mysql:3306 -- npx typeorm migration:run -d dist/infraestructure/orm/data-source.js && node dist/app.js "]