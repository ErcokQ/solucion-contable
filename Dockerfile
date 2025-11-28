########################
# 1. Builder stage
########################
FROM node:22.16-alpine AS builder

# ——— dependencias del sistema ———
RUN apk add --no-cache openjdk17-jdk    \
    && ln -s /usr/lib/jvm/default-jvm /usr/lib/jvm/java-17-openjdk   \
    && echo "JAVA_HOME=/usr/lib/jvm/java-17-openjdk" >> /etc/profile

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

# Solo JRE + netcat para wait-for
RUN apk add --no-cache openjdk17-jre-headless netcat-openbsd \
    && ln -s /usr/lib/jvm/default-jvm /usr/lib/jvm/java-17-openjdk

WORKDIR /home/app

# 🔹 Solo variables que no rompan npm aquí
ENV NODE_ENV=production \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk

COPY package*.json ./

# Aquí se instala tsconfig-paths porque ya está en "dependencies"
RUN npm ci --omit=dev --ignore-scripts

# Necesario para que tsconfig-paths sepa los paths
COPY tsconfig.json ./

COPY --from=builder /home/app/dist ./dist
COPY docs ./docs
COPY scripts/wait-for.sh /usr/local/bin/wait-for
RUN chmod +x /usr/local/bin/wait-for

# 🔹 Ahora SÍ activamos tsconfig-paths para todos los Node que se ejecuten
ENV NODE_OPTIONS="--require tsconfig-paths/register"

CMD ["sh", "-c", "wait-for mysql:3306 -- npx typeorm migration:run -d dist/infraestructure/orm/data-source.js && node dist/app.js"]


