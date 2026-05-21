import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { existsSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
dotenv.config();

// ── SERVIDOR WEB ──────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('🤖 Bot da Bridge está online!'));

// ── WHATSAPP-WEB.JS (QR CODE) ─────────────────────────────────────────────────
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';

let clientReady = false;
let latestQR = null; // Guarda o QR mais recente como imagem base64

// Caminho do Chromium instalado pelo sistema (definido no Dockerfile)
// Passa diretamente para o puppeteer-core do whatsapp-web.js ignorar o cache próprio
const CHROMIUM_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        executablePath: CHROMIUM_PATH,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Gera QR como imagem PNG base64 e guarda em memória
whatsappClient.on('qr', async (qr) => {
    console.log('📌 [QR] Novo código QR gerado. Abre /qr no browser para escanear.');
    try {
        latestQR = await QRCode.toDataURL(qr);
    } catch (err) {
        console.error('❌ Erro ao gerar imagem QR:', err);
    }
});

whatsappClient.on('ready', () => {
    console.log('✅ [WHATSAPP-WEB] Bot conectado e pronto a enviar/receber mensagens!');
    clientReady = true;
    latestQR = null; // Limpa o QR após conectar com sucesso
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ [WHATSAPP-WEB] Falha na autenticação:', msg);
    clientReady = false;
});

whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ [WHATSAPP-WEB] Bot desconectado:', reason);
    clientReady = false;
});

// ── LIMPEZA DE LOCKS DO CHROMIUM ─────────────────────────────────────────────
// PROBLEMA: No Linux, o Chromium cria o SingletonLock como um SYMLINK que aponta
// para um socket Unix. Quando o container morre, o socket desaparece mas o symlink
// fica. existsSync() retorna FALSE para symlinks quebrados — por isso a versão
// anterior não os apagava!
// SOLUÇÃO: readdirSync lista TUDO (incluindo symlinks quebrados), e unlinkSync
// consegue apagar tanto ficheiros normais como symlinks.
function cleanChromiumLocks(dir) {
    dir = dir || './.wwebjs_auth';
    if (!existsSync(dir)) return;

    try {
        // readdirSync lista TODOS os ficheiros incluindo symlinks quebrados
        const entries = readdirSync(dir);

        for (const entry of entries) {
            const fullPath = join(dir, entry);

            // Apaga qualquer ficheiro que comece com "Singleton" (Lock, Cookie, Socket)
            if (entry.startsWith('Singleton')) {
                try {
                    unlinkSync(fullPath);
                    console.log(`🔓 Chromium lock apagado: ${fullPath}`);
                } catch (e) {
                    console.warn(`⚠️ Não foi possível apagar ${fullPath}: ${e.code}`);
                }
                continue;
            }

            // Se for uma diretoria, entra recursivamente
            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    cleanChromiumLocks(fullPath);
                }
            } catch (_) {
                // statSync falha em symlinks quebrados — ignorar
            }
        }
    } catch (err) {
        console.warn('⚠️ Erro ao limpar locks do Chromium:', err.message);
    }
}

// Limpa locks ANTES de inicializar o cliente
cleanChromiumLocks();

// Arranca o cliente WhatsApp
whatsappClient.initialize().catch(err => {
    console.error('❌ Erro ao inicializar o WhatsApp Web Client:', err);
});

// ── ROTA DO QR CODE ───────────────────────────────────────────────────────────
// Abre esta URL no browser para escanear o QR com o teu telemóvel
app.get('/qr', (req, res) => {
    if (clientReady) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="pt">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bridge Bot — WhatsApp</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #0f172a;
                        color: #e2e8f0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .card {
                        background: #1e293b;
                        border: 1px solid #22c55e33;
                        border-radius: 16px;
                        padding: 40px;
                        text-align: center;
                        max-width: 400px;
                    }
                    .icon { font-size: 64px; margin-bottom: 16px; }
                    h1 { color: #22c55e; font-size: 22px; margin-bottom: 8px; }
                    p { color: #94a3b8; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon">✅</div>
                    <h1>Bot Conectado!</h1>
                    <p>O WhatsApp está autenticado e o bot está a funcionar normalmente.</p>
                </div>
            </body>
            </html>
        `);
    }

    if (!latestQR) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="pt">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bridge Bot — A Arrancar</title>
                <meta http-equiv="refresh" content="5">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #0f172a;
                        color: #e2e8f0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .card {
                        background: #1e293b;
                        border: 1px solid #f59e0b33;
                        border-radius: 16px;
                        padding: 40px;
                        text-align: center;
                        max-width: 400px;
                    }
                    .spinner {
                        width: 48px;
                        height: 48px;
                        border: 4px solid #334155;
                        border-top-color: #f59e0b;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    h1 { color: #f59e0b; font-size: 20px; margin-bottom: 8px; }
                    p { color: #94a3b8; font-size: 13px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="spinner"></div>
                    <h1>A inicializar o Chromium...</h1>
                    <p>Esta página atualiza automaticamente a cada 5 segundos.<br>O QR Code vai aparecer em breve.</p>
                </div>
            </body>
            </html>
        `);
    }

    // QR disponível — mostra a página com a imagem para escanear
    return res.send(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bridge Bot — Escanear QR</title>
            <meta http-equiv="refresh" content="30">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #0f172a;
                    color: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .card {
                    background: #1e293b;
                    border: 1px solid #3b82f633;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    max-width: 440px;
                    width: 100%;
                }
                .logo { font-size: 32px; margin-bottom: 8px; }
                h1 { color: #3b82f6; font-size: 20px; margin-bottom: 4px; }
                .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
                .qr-wrapper {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    display: inline-block;
                    margin-bottom: 20px;
                }
                .qr-wrapper img { width: 220px; height: 220px; display: block; }
                .steps {
                    text-align: left;
                    background: #0f172a;
                    border-radius: 10px;
                    padding: 16px 20px;
                    margin-top: 4px;
                }
                .steps p { color: #94a3b8; font-size: 13px; line-height: 1.8; }
                .steps span { color: #3b82f6; font-weight: 600; }
                .refresh-note { color: #475569; font-size: 11px; margin-top: 16px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">🌉</div>
                <h1>Bridge Bot — Autenticar</h1>
                <p class="subtitle">Escaneia o código QR com o teu WhatsApp</p>

                <div class="qr-wrapper">
                    <img src="${latestQR}" alt="QR Code WhatsApp">
                </div>

                <div class="steps">
                    <p><span>1.</span> Abre o WhatsApp no teu telemóvel</p>
                    <p><span>2.</span> Vai a <b>Definições → Aparelhos Ligados</b></p>
                    <p><span>3.</span> Clica em <b>"Ligar um aparelho"</b></p>
                    <p><span>4.</span> Aponta a câmera para o código acima</p>
                </div>

                <p class="refresh-note">⏱ Esta página atualiza automaticamente a cada 30 segundos</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, '0.0.0.0', () => console.log(`🌐 Servidor web ativo na porta ${port}`));

// ── SUPABASE ──────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI as _unused } from '@google/generative-ai'; // já importado acima

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://gexlmuclvadddhlbmgkl.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
    : null;

if (!supabaseKey) {
    console.error("🚨 ERRO FATAL: Falta a variável SUPABASE_SERVICE_ROLE_KEY!");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: { transport: WebSocket }
});

// ── GEMINI AI ─────────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Taxa de câmbio em memória
let currentRateStr = "1165";
supabase.from('exchange_rates')
    .select('applied_rate')
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => {
        if (data) currentRateStr = parseFloat(data.applied_rate).toLocaleString('pt-AO');
    });

// Número do administrador
const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER || '244976344207';

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const systemInstruction = `
Idioma Obrigatório:
Deves responder SEMPRE e EXCLUSIVAMENTE em Português (pt-AO), com tom profissional, educado e moderno.

Papel e Identidade:
És o assistente virtual oficial da "Bridge" (gerida pela Pixel Flex). A Bridge é um Marketplace seguro e automatizado de troca de moeda (AOA/USD). O teu nome é "Responda".
O teu tom deve ser minimalista, objetivo, seguro e transmitir confiança. Usa mensagens curtas, claras e bem formatadas.

Fluxo Principal da Bridge (Como Funciona):
Se o cliente quiser comprar Dólares (USD) ou perguntar como funciona, explica resumidamente que o processo é 100% online:
1. Criar conta e fazer a Verificação de Identidade (KYC) em https://bridge-market-delta.vercel.app
2. Simular o valor e criar o pedido na plataforma.
3. Fazer a transferência em Kwanzas para a conta indicada no site e anexar lá o comprovativo.
4. O Dólar cai na conta de destino após validação.

Capacidades Visuais (Leitura de Imagens):
- Se enviarem um COMPROVATIVO DE PAGAMENTO: Lê o valor em Kwanzas, o banco e a data. Avisa gentilmente que o envio do comprovativo deve ser feito através do botão "Enviar Comprovante" diretamente no site para ser validado.
- Se enviarem um DOCUMENTO (BI/Passaporte) ou SELFIE: Alerta estritamente que por motivos de segurança e proteção de dados, a Verificação de Identidade (KYC) tem de ser feita EXCLUSIVAMENTE no site: https://bridge-market-delta.vercel.app

Regras de Ouro (MUITO IMPORTANTE):
1. NUNCA inventes taxas de câmbio. Usa APENAS a taxa que for fornecida no início da tua instrução contextualmente.
2. NUNCA forneças ou inventes IBANs, contas bancárias ou coordenadas de pagamento. O cliente só recebe os dados de pagamento dentro da plataforma oficial e apenas após criar um pedido.
3. Não dês conselhos financeiros ou de investimento. Se perguntarem se o Dólar vai subir ou descer, diz que não podes prever o mercado.
4. Se o utilizador perguntar pelo estado de um pedido, orienta-o a verificar o estado diretamente no seu painel da Bridge na internet.

Contactos e Links Oficiais:
- Plataforma Oficial: https://bridge-market-delta.vercel.app
- Suporte Técnico / Linha Direta: 976-344-207
- WhatsApp Rápido: 976-34-42-07
- Escritório: Luanda, Estádio 11 de Novembro, Bairro Sapo 2.
`;

console.log('🟢 Bot da Bridge (whatsapp-web.js) está a inicializar...');

// ── ENVIO DE MENSAGENS ────────────────────────────────────────────────────────
async function sendWhatsappMessage(to, text) {
    const cleanTo = to.replace(/\D/g, '');

    if (!clientReady) {
        console.warn(`⚠️ [BOT] Cliente WhatsApp não está pronto. Mensagem NÃO enviada para ${cleanTo}.`);
        return;
    }

    try {
        const chatId = `${cleanTo}@c.us`;
        await whatsappClient.sendMessage(chatId, text);
        console.log(`✅ [BOT] Mensagem enviada para ${cleanTo}`);
    } catch (error) {
        console.error(`❌ [BOT] Erro ao enviar mensagem para ${cleanTo}:`, error.message);
    }
}

// ── SUPABASE REALTIME ─────────────────────────────────────────────────────────
// NOTA: Para ativar o Realtime nas tabelas, execute no SQL Editor do Supabase:
//   ALTER PUBLICATION supabase_realtime ADD TABLE
//     kyc_verifications, orders, payment_proofs, exchange_rates, whatsapp_checks;

supabase.channel('bot_admin_alerts')
    // KYC — Alertas para Admin e Cliente
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kyc_verifications' }, async (payload) => {
        const { new: newData, old: oldData } = payload;

        if (!oldData || Object.keys(oldData).length === 0 || oldData.ocr_status === undefined) return;

        // Alerta para o Admin quando KYC entra em revisão
        if (newData.ocr_status === 'pending' && oldData.ocr_status !== 'pending') {
            const alertMsg = `🚨 *Nova Verificação de Identidade (KYC)*\n\nUm cliente acabou de submeter o seu vídeo e documento.\n\n👉 Acede ao Painel de Administrador para analisar e dar o teu veredicto (Aprovar/Rejeitar).`;
            sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta KYC ao admin:', err));
        }

        // Alerta para o Cliente quando Admin aprova ou rejeita
        if (
            (newData.ocr_status === 'passed' && oldData.ocr_status !== 'passed') ||
            (newData.ocr_status === 'rejected' && oldData.ocr_status !== 'rejected')
        ) {
            try {
                const { data: profile } = await supabase.from('profiles').select('phone, full_name').eq('id', newData.user_id).maybeSingle();
                if (profile && profile.phone) {
                    let phone = profile.phone.replace(/\D/g, '');
                    if (phone.length === 9) phone = '244' + phone;
                    const clientName = profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente';

                    if (newData.ocr_status === 'passed') {
                        const msg = `🎉 *CONTA APROVADA*\n\nOlá ${clientName},\nA tua identidade foi verificada com sucesso! Já podes começar a fazer transações no Bridge Marketplace.\n\nAcede à plataforma para simular e criar o teu pedido.`;
                        sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar aprovação KYC:', err));
                    } else if (newData.ocr_status === 'rejected') {
                        const reason = newData.rejection_reason || "Documentos ilegíveis ou inválidos.";
                        const msg = `❌ *VERIFICAÇÃO RECUSADA*\n\nOlá ${clientName},\nInfelizmente, não foi possível validar a tua identidade.\n\n*Motivo:* ${reason}\n\nPor favor, acede à plataforma para tentares novamente submeter fotos mais nítidas.`;
                        sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar rejeição KYC:', err));
                    }
                }
            } catch (error) {
                console.error('Erro ao alertar cliente sobre KYC:', error);
            }
        }
    })

    // Novo pedido criado — Alerta para Admin
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        const orderRef = newOrder.order_ref || '#' + newOrder.id.slice(0, 8).toUpperCase();
        const alertMsg = `🛒 *NOVO PEDIDO (Bridge)*\n\nUm cliente acabou de criar um novo pedido!\n\n💵 Valor: *$${parseFloat(newOrder.amount_usd).toFixed(2)}*\n🇦🇴 Total a Pagar: *${parseFloat(newOrder.amount_aoa).toLocaleString('pt-AO')} Kz*\n📄 Referência: ${orderRef}\n🏦 Destino: ${newOrder.destination_account}\n\n👉 Acede ao Painel de Administrador para gerir.`;
        sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de novo pedido:', err));
    })

    // Comprovativo enviado — Alerta para Admin
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payment_proofs' }, (payload) => {
        const alertMsg = `💰 *PAGAMENTO RECEBIDO (Bridge)*\n\nUm cliente acabou de enviar um comprovante de pagamento!\n\n👉 Acede ao teu Painel de Administrador para validar a transferência e confirmar o envio dos dólares.`;
        sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de pagamento:', err));
    })

    // Pedido concluído — Alerta para Cliente
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, async (payload) => {
        const { new: newData, old: oldData } = payload;
        if (!oldData || Object.keys(oldData).length === 0 || oldData.status === undefined) return;

        if (newData.status === 'completed' && oldData.status !== 'completed') {
            try {
                const { data: profile } = await supabase.from('profiles').select('phone, full_name').eq('id', newData.user_id).maybeSingle();
                if (profile && profile.phone) {
                    let phone = profile.phone.replace(/\D/g, '');
                    if (phone.length === 9) phone = '244' + phone;
                    const orderRef = newData.order_ref || '#' + newData.id.slice(0, 8).toUpperCase();
                    const clientName = profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente';
                    const msg = `✅ *PEDIDO ENVIADO*\n\nOlá ${clientName},\nO teu pedido ${orderRef} foi processado e os dólares já foram enviados para a tua conta!\n\n💵 Valor: *$${parseFloat(newData.amount_usd).toFixed(2)}*\n🏦 Destino: ${newData.destination_account}\n\nObrigado pela preferência! 🚀`;
                    sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar mensagem ao cliente:', err));
                }
            } catch (error) {
                console.error('Erro ao alertar o cliente sobre pedido concluído:', error);
            }
        }
    })

    // Nova taxa de câmbio — Atualiza memória do bot
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exchange_rates' }, (payload) => {
        currentRateStr = parseFloat(payload.new.applied_rate).toLocaleString('pt-AO');
        console.log(`📈 Taxa de câmbio atualizada: ${currentRateStr} Kz/USD`);
    })

    // Verificação de número WhatsApp — via whatsapp-web.js (sem Cloud API)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_checks' }, async (payload) => {
        const check = payload.new;
        console.log(`🔍 A verificar número WhatsApp: ${check.phone}`);

        if (check.status !== 'pending') return;

        try {
            let phone = check.phone.replace(/\D/g, '');
            if (!phone.startsWith('244')) phone = '244' + phone;

            let isRegistered = false;

            if (clientReady) {
                // Usa o whatsapp-web.js para verificar nativamente (sem Cloud API!)
                const numberId = await whatsappClient.getNumberId(phone);
                isRegistered = numberId !== null;
            } else {
                // Bot não conectado — marca como válido para não bloquear o utilizador
                console.warn(`⚠️ Bot não conectado. A marcar ${phone} como válido por defeito.`);
                isRegistered = true;
            }

            await supabase.from('whatsapp_checks')
                .update({ status: isRegistered ? 'valid' : 'invalid' })
                .eq('id', check.id);

            console.log(`✅ Número ${phone}: ${isRegistered ? 'válido' : 'inválido'}`);
        } catch (err) {
            console.error('Erro na verificação do WhatsApp:', err);
            // Em caso de erro, marca como válido para não bloquear
            await supabase.from('whatsapp_checks').update({ status: 'valid' }).eq('id', check.id);
        }
    })

    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('✅ Canal Supabase Realtime ativo! Bot configurado para alertas e validação nativa de números de WhatsApp.');
        } else if (status === 'CHANNEL_ERROR') {
            console.error('🚨 CULPADO ENCONTRADO: Verifica se as tabelas estão no Realtime (ver instruções abaixo).');
            console.error('   Execute no SQL Editor do Supabase:');
            console.error('   ALTER PUBLICATION supabase_realtime ADD TABLE kyc_verifications, orders, payment_proofs, exchange_rates, whatsapp_checks;');
        } else if (status === 'TIMED_OUT') {
            console.warn('⚠️ Canal Realtime com timeout. O Supabase vai tentar reconectar...');
        } else {
            console.log('ℹ️ Estado da subscrição Supabase:', status);
        }
    });

// ── MODELO GEMINI ─────────────────────────────────────────────────────────────
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction,
});

const userChats = new Map();

// Limpa cache de chats a cada 24h para evitar memory leak
setInterval(() => {
    userChats.clear();
    console.log('🧹 Cache de chats locais limpo para libertar memória do servidor.');
}, 24 * 60 * 60 * 1000);

// ── PROCESSAR MENSAGENS RECEBIDAS ─────────────────────────────────────────────
async function handleIncomingMessage(msg) {
    console.log(`💬 Mensagem recebida de ${msg.from}: ${msg.body || '(Multimédia)'}`);

    try {
        let chat = userChats.get(msg.from);
        if (!chat) {
            const { data } = await supabase
                .from('bot_history')
                .select('history')
                .eq('phone', msg.from)
                .maybeSingle();

            const previousHistory = data?.history || [];
            chat = model.startChat({ history: previousHistory });
            userChats.set(msg.from, chat);
        }

        let promptPayload = [];

        // Processar imagem/ficheiro multimédia
        if (msg.hasMedia && msg.messageObj) {
            try {
                const media = await msg.messageObj.downloadMedia();
                if (media) {
                    promptPayload.push({
                        inlineData: { data: media.data, mimeType: media.mimetype }
                    });
                    promptPayload.push(msg.body || "Analisa esta imagem/documento e responde de acordo com as tuas instruções.");
                } else {
                    promptPayload.push("Ocorreu um erro ao tentar ler a imagem que enviaste. Podes tentar enviar novamente?");
                }
            } catch (err) {
                console.error("❌ Erro ao descarregar media:", err);
                promptPayload.push("Ocorreu um erro ao tentar ler o ficheiro que enviaste. Podes tentar enviar novamente?");
            }
        } else {
            // Injetar taxa de câmbio no contexto quando relevante
            let text = msg.body || "";
            if (/(taxa|câmbio|cambio|kwanza|kz|dólar|dolar|usd|aoa|preço|valor|custa|pagar)/i.test(text)) {
                text = `[INSTRUÇÃO DO SISTEMA: A taxa de câmbio de hoje na Bridge é de ${currentRateStr} Kwanzas por cada 1 Dólar USD.]\n\nMensagem do cliente: ${text}`;
            }
            promptPayload.push(text);
        }

        const result = await chat.sendMessage(promptPayload);
        const replyText = result.response.text();

        // Usa message.reply() diretamente — evita o problema @lid/@c.us
        // O whatsapp-web.js sabe exatamente para onde enviar sem conversão de ID
        if (msg.messageObj) {
            await msg.messageObj.reply(replyText);
        } else {
            await sendWhatsappMessage(msg.from, replyText);
        }

        // Guarda histórico no Supabase (últimas 16 interações)
        const updatedHistory = await chat.getHistory();
        const { error: dbError } = await supabase
            .from('bot_history')
            .upsert({ phone: msg.from, history: updatedHistory.slice(-16) }, { onConflict: 'phone' });

        if (dbError) {
            console.error('Erro ao guardar histórico no Supabase:', dbError);
        }
    } catch (error) {
        console.error('Erro na integração com a IA:', error);
        // Tenta responder via reply() em caso de erro também
        if (msg.messageObj) {
            try {
                await msg.messageObj.reply('🔒 Ocorreu uma interrupção inesperada. Por favor, tente novamente em instantes ou contacte o suporte no número 976-344-207.');
            } catch (replyErr) {
                console.error('Erro ao enviar mensagem de erro:', replyErr);
            }
        } else {
            await sendWhatsappMessage(msg.from, '🔒 Ocorreu uma interrupção inesperada. Por favor, tente novamente em instantes ou contacte o suporte no número 976-344-207.');
        }
    }
}

// ── LISTENER DE MENSAGENS RECEBIDAS ──────────────────────────────────────────
whatsappClient.on('message', async (message) => {
    // Ignorar grupos e transmissões
    if (message.from.endsWith('@g.us') || message.from.endsWith('@broadcast')) return;

    let from;

    // Novo protocolo WhatsApp usa @lid (Linked Device ID) em vez de @c.us
    // Precisamos de obter o número real via getContact()
    if (message.from.endsWith('@lid')) {
        try {
            const contact = await message.getContact();
            // contact.number devolve o número sem indicativo ou com, depende da versão
            from = contact.number || message.from.replace('@lid', '');
            console.log(`🔄 [LID] Número real resolvido: ${from}`);
        } catch (e) {
            // Fallback: usa o número do LID diretamente
            from = message.from.replace('@lid', '');
            console.warn(`⚠️ [LID] Não foi possível resolver contacto, usando fallback: ${from}`);
        }
    } else {
        from = message.from.replace('@c.us', '');
    }

    const body = message.body;
    const hasMedia = message.hasMedia;

    await handleIncomingMessage({ from, body, hasMedia, messageObj: message });
});

// ── PROTEÇÃO CONTRA CRASHES ───────────────────────────────────────────────────
process.on('uncaughtException', err => console.error('🚨 [CRASH FATAL DO NODE]:', err));
process.on('unhandledRejection', err => console.error('🚨 [PROMESSA REJEITADA]:', err));