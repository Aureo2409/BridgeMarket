FROM node:22-bullseye

# 1. Instala o Chromium e as dependências do Linux de forma segura
RUN apt-get update && apt-get install -y \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Configurações para forçar o Puppeteer a usar o Chromium que acabámos de instalar
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "bot.js"]