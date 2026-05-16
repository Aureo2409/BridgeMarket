FROM node:22-bookworm

# 1. Atualiza para o Debian 12 (Bookworm) e instala TODAS as dependências gráficas
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 libpango-1.0-0 libgtk-3-0 libegl1 libgles2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Configurações para forçar o Puppeteer a usar o Chromium que acabámos de instalar
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "bot.js"]