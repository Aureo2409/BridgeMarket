const { join } = require('path');

module.exports = {
    // Cache local para desenvolvimento — em produção o PUPPETEER_EXECUTABLE_PATH sobrepõe isto
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
    // Impede download do Chrome quando a variável de ambiente estiver definida
    skipDownload: process.env.PUPPETEER_SKIP_DOWNLOAD === 'true',
};