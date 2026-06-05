import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { existsSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';
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

// ── DIDIT.ME — KYC SEGURO ───────────────────────────────────────────────────
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;

// Helper para descarregar um ficheiro do DIDIt e enviar para o nosso Supabase Storage
async function downloadAndUploadToSupabase(url, userId, type) {
    if (!url) return null;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = await res.arrayBuffer();

        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        if (contentType.includes('pdf')) ext = 'pdf';
        if (contentType.includes('mp4')) ext = 'mp4';
        if (contentType.includes('webm')) ext = 'webm';

        const path = `${userId}/${type}_${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
            .from('Documentos kyc')
            .upload(path, Buffer.from(buffer), {
                contentType,
                upsert: true
            });

        if (error) throw error;
        return path;
    } catch (e) {
        console.error(`❌ Erro ao guardar ficheiro do DIDIt para o Supabase (${type}):`, e.message);
        return null;
    }
}

// 1. Gera sessão segura de KYC v3 (chamada pelo frontend)
app.post('/api/didit/session', async (req, res) => {
    const { user_id } = req.body;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch('https://verification.didit.me/v3/session/', {
            method: 'POST',
            headers: {
                'x-api-key': DIDIT_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workflow_id: process.env.DIDIT_WORKFLOW_ID || '5b5b0273-9a79-4741-af8a-be62d770dc28',
                vendor_data: user_id,
                callback: process.env.DIDIT_CALLBACK_URL || 'https://bridge-market-delta.vercel.app'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { data = {}; }

        if (!response.ok) {
            console.error('❌ DIDIt session error:', response.status, text);
            return res.status(502).json({ error: 'Falha ao criar sessão DIDIt: ' + (data.message || text) });
        }

        const session_url = data.url || data.session_url || data.verification_url;
        if (!session_url) {
            console.error('❌ DIDIt sem URL na resposta:', data);
            return res.status(502).json({ error: 'DIDIt não devolveu URL de verificação.' });
        }

        res.json({ session_url });
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('❌ Timeout na sessão DIDIt (servidor DIDIt não respondeu a tempo)');
            return res.status(504).json({ error: 'O servidor do DIDIt demorou muito a responder. Por favor, contacte o suporte ou use a verificação manual.' });
        }
        console.error('Erro na sessão DIDIt:', error);
        res.status(500).json({ error: 'Falha ao conectar com DIDIt.' });
    }
});

// 2. Webhook DIDIt — recebe decisão, descarrega ficheiros e coloca em pendente para revisão do Admin
app.post('/api/didit/webhook', async (req, res) => {
    const payload = req.body;
    console.log('🔔 Webhook DIDIt recebido:', JSON.stringify(payload).slice(0, 200));
    try {
        const sessionId = payload.session_id || payload.id;
        const userId = payload.vendor_data || payload.client_reference_id;
        const status = payload.status || (payload.decision && payload.decision.status);

        if (!userId) {
            console.warn('⚠️ Webhook do DIDIt sem vendor_data / userId');
            return res.status(200).send('Ignorado (sem userId)');
        }

        // 1. Proteger contra sobrescrita de aprovação manual do administrador
        const { data: existing } = await supabase
            .from('kyc_verifications')
            .select('ocr_status, document_url, selfie_url')
            .eq('user_id', userId)
            .maybeSingle();

        if (existing && existing.ocr_status === 'passed') {
            console.log(`✅ KYC do utilizador ${userId} já foi aprovado pelo Admin. Ignorando webhook.`);
            return res.status(200).send('OK');
        }

        let documentPath = existing?.document_url || null;
        let selfiePath = existing?.selfie_url || null;

        // 2. Obter decisão detalhada e descarregar as imagens do DIDIt
        if (sessionId) {
            try {
                const decisionResponse = await fetch(`https://verification.didit.me/v3/session/${sessionId}/decision/`, {
                    headers: { 'x-api-key': DIDIT_API_KEY }
                });

                if (decisionResponse.ok) {
                    const decision = await decisionResponse.json();
                    
                    const idVerification = decision.id_verification || {};
                    const liveness = decision.liveness || {};

                    const docUrl = idVerification.full_front_image || idVerification.front_image || idVerification.full_back_image || idVerification.back_image;
                    const selfieUrl = liveness.reference_image || liveness.front_image || (decision.face_match && decision.face_match.reference_image);

                    if (docUrl) {
                        console.log(`📥 A descarregar documento do DIDIt para o Supabase...`);
                        const uploadedDoc = await downloadAndUploadToSupabase(docUrl, userId, 'doc');
                        if (uploadedDoc) documentPath = uploadedDoc;
                    }

                    if (selfieUrl) {
                        console.log(`📥 A descarregar selfie de liveness do DIDIt...`);
                        const uploadedSelfie = await downloadAndUploadToSupabase(selfieUrl, userId, 'selfie');
                        if (uploadedSelfie) selfiePath = uploadedSelfie;
                    }
                } else {
                    console.error('❌ Falha ao obter decisão do DIDIt:', decisionResponse.status);
                }
            } catch (apiErr) {
                console.error('❌ Erro na API do DIDIt ao descarregar imagens:', apiErr);
            }
        }

        // 3. Atualizar base de dados
        const isApproved = ['Approved', 'passed', 'completed', 'approved'].includes(status);
        
        // Marcamos como "pending" para que o administrador possa fazer a validação manual final 
        // tendo os documentos e as faces em tempo real salvos no nosso sistema.
        const ocrStatus = isApproved ? 'pending' : 'rejected';
        const livenessStatus = isApproved ? 'pending' : 'rejected';

        await supabase.from('kyc_verifications').upsert({
            user_id: userId,
            document_url: documentPath,
            selfie_url: selfiePath,
            ocr_status: ocrStatus,
            liveness_status: livenessStatus,
            step_personal_done: true,
            rejection_reason: isApproved ? null : (payload.reason || 'Verificação automática recusada pelo DIDIt.'),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        console.log(`✅ Webhook processado. KYC do utilizador ${userId} guardado no Supabase com imagens.`);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro ao processar Webhook DIDIt:', error);
        res.status(500).send('Erro interno');
    }
});

app.listen(port, '0.0.0.0', () => console.log(`🌐 Servidor web ativo na porta ${port}`));

// ── SUPABASE ──────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
    : null;

if (!supabaseUrl) {
    console.error("🚨 ERRO FATAL: Falta a variável VITE_SUPABASE_URL!");
}
if (!supabaseKey) {
    console.error("🚨 ERRO FATAL: Falta a variável SUPABASE_SERVICE_ROLE_KEY!");
}

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey, {
    realtime: { transport: WebSocket }
}) : null;

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

// ── CONFIGURAÇÕES DE E-MAIL (SMTP) ──────────────────────────────────────────
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || '"Bridge Marketplace" <no-reply@bridge.co>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || null;

let mailTransporter = null;

if (smtpHost && smtpUser && smtpPass) {
    try {
        mailTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        console.log('📬 [SMTP] Transportador de e-mail SMTP inicializado com sucesso!');
    } catch (error) {
        console.error('❌ [SMTP] Erro ao inicializar o transportador de e-mail:', error.message);
    }
} else {
    console.warn('⚠️ [SMTP] Configurações de SMTP em falta. As notificações por e-mail estão desativadas ou em modo de simulação/logs.');
}

// Auxiliar: Gera template HTML responsivo e elegante da Bridge
function buildEmailTemplate(title, bodyHtml, actionText = null, actionUrl = null) {
    const primaryColor = '#7c3aed'; // Roxo/Indigo da Bridge
    const darkBg = '#0f172a'; // Slate-900
    
    let actionBtnHtml = '';
    if (actionText && actionUrl) {
        actionBtnHtml = `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${actionUrl}" style="background-color: ${primaryColor}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.25); font-family: sans-serif;">
                    ${actionText}
                </a>
            </div>
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
            <tr>
                <td style="background-color: ${darkBg}; padding: 30px; text-align: center; border-bottom: 4px solid ${primaryColor};">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 800; font-family: sans-serif;">
                        BRIDGE <span style="color: ${primaryColor}; font-size: 14px; font-weight: normal; vertical-align: middle;">AOA/USD</span>
                    </h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 30px; line-height: 1.6;">
                    <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        ${title}
                    </h2>
                    <div style="font-size: 16px; color: #475569;">
                        ${bodyHtml}
                    </div>
                    ${actionBtnHtml}
                </td>
            </tr>
            <tr>
                <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 8px 0;">Este é um e-mail automático enviado pela plataforma **Bridge**.</p>
                    <p style="margin: 0 0 8px 0;">Luanda, Estádio 11 de Novembro, Bairro Sapo 2. Suporte: 976-344-207</p>
                    <p style="margin: 0; font-weight: bold; color: #475569;">&copy; ${new Date().getFullYear()} Pixel Flex. Todos os direitos reservados.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

// Auxiliar: Envia e-mail SMTP com fallback
async function sendEmailNotification(to, subject, htmlContent, textFallback = "") {
    if (!mailTransporter) {
        console.warn(`⚠️ [SMTP] Envio de e-mail abortado para ${to}. Transportador SMTP não está configurado.`);
        return false;
    }

    try {
        const mailOptions = {
            from: smtpFrom,
            to: to,
            subject: subject,
            text: textFallback || subject,
            html: htmlContent
        };

        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`✅ [SMTP] E-mail enviado com sucesso para ${to}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`❌ [SMTP] Erro ao enviar e-mail para ${to}:`, error.message);
        return false;
    }
}

// Auxiliar: Resolve o email de um utilizador no Auth do Supabase usando Service Role
async function getUserEmail(userId) {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error) {
            console.error(`❌ [SUPABASE AUTH] Erro ao buscar e-mail do utilizador ${userId}:`, error.message);
            return null;
        }
        return data?.user?.email || null;
    } catch (err) {
        console.error(`❌ [SUPABASE AUTH] Exceção ao buscar e-mail do utilizador ${userId}:`, err.message);
        return null;
    }
}

// Auxiliar: Verifica se as notificações por e-mail estão ativas no perfil
async function isEmailNotificationEnabled(userId) {
    if (!supabase) return true;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('email_notifications')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            console.warn(`⚠️ [SUPABASE BD] Erro ao verificar preferências de e-mail de ${userId}:`, error.message);
            return true;
        }
        return data ? data.email_notifications !== false : true;
    } catch (err) {
        return true;
    }
}

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

            if (ADMIN_EMAIL) {
                const subject = `🚨 Nova Verificação de Identidade (KYC) - Bridge`;
                const html = buildEmailTemplate(
                    "Nova Verificação de Identidade (KYC) Pendente",
                    `<p>Um cliente acabou de submeter o seu vídeo e documentos para verificação.</p>
                     <p>Por favor, aceda ao Painel de Administrador da Bridge para analisar e dar o veredicto (Aprovar/Rejeitar).</p>`,
                    "Aceder ao Painel",
                    "https://bridge-market-delta.vercel.app"
                );
                sendEmailNotification(ADMIN_EMAIL, subject, html, "Nova Verificação de Identidade (KYC) pendente na Bridge.").catch(err => console.error('Erro ao enviar e-mail KYC ao admin:', err));
            }
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

                // Disparo de e-mail em paralelo se ativado
                const userEmail = await getUserEmail(newData.user_id);
                const emailEnabled = await isEmailNotificationEnabled(newData.user_id);

                if (userEmail && emailEnabled) {
                    const clientName = profile ? (profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente') : 'Cliente';
                    if (newData.ocr_status === 'passed') {
                        const subject = `🎉 Conta Aprovada - Bridge Marketplace`;
                        const html = buildEmailTemplate(
                            "Sua Conta foi Aprovada!",
                            `<p>Olá <strong>${clientName}</strong>,</p>
                             <p>Temos o prazer de informar que a tua identidade foi verificada com sucesso pela nossa equipa!</p>
                             <p>A tua conta está agora totalmente ativa. Já podes simular, criar pedidos e realizar transações de câmbio seguras no Bridge Marketplace.</p>`,
                            "Aceder ao Marketplace",
                            "https://bridge-market-delta.vercel.app"
                        );
                        sendEmailNotification(userEmail, subject, html, "A tua identidade foi verificada com sucesso no Bridge Marketplace!").catch(err => console.error('Erro ao enviar e-mail de aprovação KYC:', err));
                    } else if (newData.ocr_status === 'rejected') {
                        const reason = newData.rejection_reason || "Documentos ilegíveis ou inválidos.";
                        const subject = `❌ Verificação de Identidade Recusada - Bridge Marketplace`;
                        const html = buildEmailTemplate(
                            "Verificação de Identidade Recusada",
                            `<p>Olá <strong>${clientName}</strong>,</p>
                             <p>Lamentamos informar que não foi possível validar os documentos e vídeo submetidos.</p>
                             <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 15px; margin: 20px 0; border-radius: 4px; font-weight: bold; color: #991b1b;">
                                 Motivo: ${reason}
                             </div>
                             <p>Por favor, acede à plataforma oficial para submeter novamente fotografias mais nítidas e legíveis dos teus documentos.</p>`,
                            "Submeter Novamente",
                            "https://bridge-market-delta.vercel.app"
                        );
                        sendEmailNotification(userEmail, subject, html, `Infelizmente, a tua identidade não pôde ser verificada na Bridge. Motivo: ${reason}`).catch(err => console.error('Erro ao enviar e-mail de rejeição KYC:', err));
                    }
                }
            } catch (error) {
                console.error('Erro ao alertar cliente sobre KYC:', error);
            }
        }
    })

    // Acesso semanal - Alertas de upload, aprovação e rejeição de comprovativo de 500 Kz
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, async (payload) => {
        const { new: newData, old: oldData } = payload;
        if (!oldData || Object.keys(oldData).length === 0 || oldData.access_status === undefined) return;

        // 1. Alerta para o Admin quando um comprovativo é enviado
        if (newData.access_status === 'pending_payment' && oldData.access_status !== 'pending_payment') {
            const alertMsg = `🚨 *PAGAMENTO DE ACESSO PENDENTE (Bridge)*\n\nO utilizador *${newData.full_name || "Cliente"}* (${newData.phone || "Sem telefone"}) acabou de submeter um comprovativo para a taxa de acesso semanal (500 Kz).\n\n👉 Acede ao Painel de Administrador (separador KYC) para validar e aprovar o acesso.`;
            sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar whatsapp de acesso semanal ao admin:', err));

            if (ADMIN_EMAIL) {
                const subject = `🚨 Comprovativo de Acesso Semanal Pendente - Bridge`;
                const html = buildEmailTemplate(
                    "Solicitação de Acesso Semanal Pendente",
                    `<p>O utilizador <strong>${newData.full_name || "Cliente"}</strong> (${newData.phone || "Sem telefone"}) submeteu um comprovativo de pagamento da taxa de acesso de 500 Kz.</p>
                     <p>Por favor, aceda ao Painel de Administrador da Bridge para validar a transferência e ativar o acesso.</p>`,
                    "Aceder ao Painel",
                    "https://bridge-market-delta.vercel.app"
                );
                sendEmailNotification(ADMIN_EMAIL, subject, html, `Solicitação de acesso semanal de 500 Kz pendente na Bridge para ${newData.full_name || "Cliente"}.`).catch(err => console.error('Erro ao enviar e-mail de acesso semanal ao admin:', err));
            }
        }

        // 2. Alerta para o Cliente quando aprovado
        if (newData.access_status === 'active' && oldData.access_status === 'pending_payment') {
            try {
                if (newData.phone) {
                    let phone = newData.phone.replace(/\D/g, '');
                    if (phone.length === 9) phone = '244' + phone;
                    const clientName = newData.full_name ? newData.full_name.split(' ')[0] : 'Cliente';
                    const msg = `🎉 *ACESSO SEMANAL ATIVO*\n\nOlá ${clientName},\nO teu comprovativo de pagamento de 500 Kz foi validado com sucesso!\nO teu acesso de 7 dias à plataforma BridgeP2P já está ativo. Bons negócios! 🚀`;
                    sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar WhatsApp de aprovação de acesso:', err));
                }

                const userEmail = await getUserEmail(newData.id);
                const emailEnabled = await isEmailNotificationEnabled(newData.id);
                if (userEmail && emailEnabled) {
                    const clientName = newData.full_name ? newData.full_name.split(' ')[0] : 'Cliente';
                    const subject = `🎉 Acesso Semanal Ativo - Bridge Marketplace`;
                    const html = buildEmailTemplate(
                        "O teu Acesso Semanal está Ativo!",
                        `<p>Olá <strong>${clientName}</strong>,</p>
                         <p>Temos o prazer de informar que o teu comprovativo de pagamento de 500 Kz foi validado e aprovado pela nossa equipa!</p>
                         <p>O teu acesso de 7 dias ao mercado P2P já está ativo e podes transacionar livremente sem taxas ou comissões por operação.</p>`,
                        "Aceder ao Marketplace",
                        "https://bridge-market-delta.vercel.app"
                    );
                    sendEmailNotification(userEmail, subject, html, "O teu acesso semanal de 7 dias foi ativado com sucesso no Bridge Marketplace!").catch(err => console.error('Erro ao enviar e-mail de aprovação de acesso:', err));
                }
            } catch (err) {
                console.error('Erro ao notificar cliente sobre aprovação de acesso semanal:', err);
            }
        }

        // 3. Alerta para o Cliente quando rejeitado
        if (newData.access_status === 'inactive' && oldData.access_status === 'pending_payment') {
            try {
                if (newData.phone) {
                    let phone = newData.phone.replace(/\D/g, '');
                    if (phone.length === 9) phone = '244' + phone;
                    const clientName = newData.full_name ? newData.full_name.split(' ')[0] : 'Cliente';
                    const msg = `❌ *ACESSO SEMANAL RECUSADO*\n\nOlá ${clientName},\nLamentamos, mas o teu comprovativo de pagamento de 500 Kz não pôde ser validado.\n\nPor favor, aceda à plataforma para carregar o comprovativo correto.`;
                    sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar WhatsApp de rejeição de acesso:', err));
                }

                const userEmail = await getUserEmail(newData.id);
                const emailEnabled = await isEmailNotificationEnabled(newData.id);
                if (userEmail && emailEnabled) {
                    const clientName = newData.full_name ? newData.full_name.split(' ')[0] : 'Cliente';
                    const subject = `❌ Acesso Semanal Recusado - Bridge Marketplace`;
                    const html = buildEmailTemplate(
                        "Comprovativo de Acesso Recusado",
                        `<p>Olá <strong>${clientName}</strong>,</p>
                         <p>Lamentamos informar que não foi possível validar o comprovativo de pagamento de 500 Kz submetido.</p>
                         <p>Por favor, aceda à plataforma oficial para submeter novamente o comprovativo de transferência bancária correto.</p>`,
                        "Submeter Novamente",
                        "https://bridge-market-delta.vercel.app"
                    );
                    sendEmailNotification(userEmail, subject, html, "O teu comprovativo de pagamento de 500 Kz foi recusado no Bridge Marketplace.").catch(err => console.error('Erro ao enviar e-mail de rejeição de acesso:', err));
                }
            } catch (err) {
                console.error('Erro ao notificar cliente sobre rejeição de acesso semanal:', err);
            }
        }
    })

    // Novo pedido criado — Alerta para Admin
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        const orderRef = newOrder.order_ref || '#' + newOrder.id.slice(0, 8).toUpperCase();
        const alertMsg = `🛒 *NOVO PEDIDO (Bridge)*\n\nUm cliente acabou de criar um novo pedido!\n\n💵 Valor: *$${parseFloat(newOrder.amount_usd).toFixed(2)}*\n🇦🇴 Total a Pagar: *${parseFloat(newOrder.amount_aoa).toLocaleString('pt-AO')} Kz*\n📄 Referência: ${orderRef}\n🏦 Destino: ${newOrder.destination_account}\n\n👉 Acede ao Painel de Administrador para gerir.`;
        sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de novo pedido:', err));

        if (ADMIN_EMAIL) {
            const subject = `🛒 Novo Pedido Criado - ${orderRef} - Bridge`;
            const html = buildEmailTemplate(
                "Novo Pedido no Marketplace",
                `<p>Um cliente acabou de criar um novo pedido na plataforma!</p>
                 <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
                     <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Referência:</td><td style="padding: 10px 0; text-align: right;">${orderRef}</td></tr>
                     <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Valor em Dólares:</td><td style="padding: 10px 0; text-align: right; color: #16a34a; font-weight: bold;">$${parseFloat(newOrder.amount_usd).toFixed(2)}</td></tr>
                     <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Total em Kwanzas:</td><td style="padding: 10px 0; text-align: right; font-weight: bold;">${parseFloat(newOrder.amount_aoa).toLocaleString('pt-AO')} Kz</td></tr>
                     <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Destino:</td><td style="padding: 10px 0; text-align: right;">${newOrder.destination} (${newOrder.destination_account})</td></tr>
                 </table>
                 <p>Por favor, aceda ao Painel de Administrador para gerir o pedido.</p>`,
                "Aceder ao Painel",
                "https://bridge-market-delta.vercel.app"
            );
            sendEmailNotification(ADMIN_EMAIL, subject, html, `Novo pedido ${orderRef} no valor de $${parseFloat(newOrder.amount_usd).toFixed(2)} criado na Bridge.`).catch(err => console.error('Erro ao enviar e-mail de novo pedido ao admin:', err));
        }
    })

    // Comprovativo enviado — Alerta para Admin
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payment_proofs' }, (payload) => {
        const alertMsg = `💰 *PAGAMENTO RECEBIDO (Bridge)*\n\nUm cliente acabou de enviar um comprovante de pagamento!\n\n👉 Acede ao teu Painel de Administrador para validar a transferência e confirmar o envio dos dólares.`;
        sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de pagamento:', err));

        if (ADMIN_EMAIL) {
            const subject = `💰 Comprovativo de Pagamento Recebido - Bridge`;
            const html = buildEmailTemplate(
                "Comprovativo de Pagamento Recebido",
                `<p>Um cliente acabou de submeter um comprovativo de pagamento na plataforma.</p>
                 <p>Por favor, aceda ao Painel de Administrador para validar a transferência de Kwanzas e confirmar o envio correspondente dos dólares.</p>`,
                "Validar no Painel",
                "https://bridge-market-delta.vercel.app"
            );
            sendEmailNotification(ADMIN_EMAIL, subject, html, "Novo comprovativo de pagamento recebido na Bridge.").catch(err => console.error('Erro ao enviar e-mail de comprovativo ao admin:', err));
        }
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

                // Disparo de e-mail em paralelo se ativado
                const userEmail = await getUserEmail(newData.user_id);
                const emailEnabled = await isEmailNotificationEnabled(newData.user_id);

                if (userEmail && emailEnabled) {
                    const clientName = profile ? (profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente') : 'Cliente';
                    const orderRef = newData.order_ref || '#' + newData.id.slice(0, 8).toUpperCase();
                    const subject = `✅ Pedido Enviado - ${orderRef} - Bridge Marketplace`;
                    const html = buildEmailTemplate(
                        "O teu pedido foi enviado com sucesso!",
                        `<p>Olá <strong>${clientName}</strong>,</p>
                         <p>Temos o prazer de informar que o teu pedido de compra de dólares foi processado e os fundos já foram enviados para a tua conta de destino!</p>
                         <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
                             <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Referência:</td><td style="padding: 10px 0; text-align: right;">${orderRef}</td></tr>
                             <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Valor Recebido:</td><td style="padding: 10px 0; text-align: right; color: #16a34a; font-weight: bold;">$${parseFloat(newData.amount_usd).toFixed(2)}</td></tr>
                             <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Destino dos Fundos:</td><td style="padding: 10px 0; text-align: right;">${newData.destination} (${newData.destination_account})</td></tr>
                         </table>
                         <p>Muito obrigado pela tua preferência e confiança na **Bridge**. Se gostaste do nosso serviço, partilha com os teus amigos! 🚀</p>`,
                        "Ver o meu Painel",
                        "https://bridge-market-delta.vercel.app"
                    );
                    sendEmailNotification(userEmail, subject, html, `O teu pedido ${orderRef} foi concluído e os dólares enviados para a tua conta de destino na Bridge.`).catch(err => console.error('Erro ao enviar e-mail de pedido concluído:', err));
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

// ── MOTOR DE PROCESSAMENTO DE NOTIFICAÇÕES ────────────────────────────────────

// Processa uma única notificação pendente
async function processNotification(notification) {
    if (notification.status !== 'pending') return;

    console.log(`✉️ [NOTIFICAÇÕES] A processar notificação ${notification.id} (canal: ${notification.channel}, template: ${notification.template})`);

    // ───────────────── PROCESSAMENTO DE E-MAIL ─────────────────
    if (notification.channel === 'email') {
        let email = null;

        // 1. Resolver o e-mail de destino de forma inteligente
        if (notification.recipient_email) {
            email = notification.recipient_email.trim();
        } else if (notification.destination && notification.destination.includes('@')) {
            email = notification.destination.trim();
        }

        // Se ainda não temos o e-mail, procuramos no Auth do Supabase
        if (!email && notification.user_id) {
            email = await getUserEmail(notification.user_id);
        }

        if (!email) {
            console.warn(`⚠️ [NOTIFICAÇÕES] Sem e-mail de destino para a notificação ${notification.id}. Marcando como falhada.`);
            await supabase
                .from('notifications')
                .update({ status: 'failed', sent_at: new Date().toISOString() })
                .eq('id', notification.id);
            return;
        }

        let subject = 'Notificação - Bridge Marketplace';
        let bodyHtml = notification.message_body;

        // 2. Se o corpo estiver vazio, construímos com base no template e dados do pedido
        if (!bodyHtml) {
            if (notification.template === 'new_order' && notification.order_id) {
                try {
                    const { data: orderData } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('id', notification.order_id)
                        .maybeSingle();
                    if (orderData) {
                        const orderRef = orderData.order_ref || '#' + orderData.id.slice(0, 8).toUpperCase();
                        subject = `🛒 Novo Pedido Criado - ${orderRef} - Bridge`;
                        bodyHtml = `<p>Um cliente acabou de criar um novo pedido na plataforma!</p>
                                     <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
                                         <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Referência:</td><td style="padding: 10px 0; text-align: right;">${orderRef}</td></tr>
                                         <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Valor em Dólares:</td><td style="padding: 10px 0; text-align: right; color: #16a34a; font-weight: bold;">$${parseFloat(orderData.amount_usd).toFixed(2)}</td></tr>
                                         <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Total em Kwanzas:</td><td style="padding: 10px 0; text-align: right; font-weight: bold;">${parseFloat(orderData.amount_aoa).toLocaleString('pt-AO')} Kz</td></tr>
                                         <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 10px 0; font-weight: bold;">Destino:</td><td style="padding: 10px 0; text-align: right;">${orderData.destination} (${orderData.destination_account})</td></tr>
                                     </table>
                                     <p>Por favor, acede ao Painel de Administrador para gerir.</p>`;
                    }
                } catch (err) {
                    console.error(`❌ [NOTIFICAÇÕES] Erro ao carregar dados do pedido para a notificação ${notification.id}:`, err);
                }
            } else if (notification.template === 'welcome') {
                subject = 'Bem-vindo ao Bridge Marketplace! 🎉';
                bodyHtml = `<p>Bem-vindo ao Bridge Marketplace! A tua conta foi criada com sucesso.</p>
                             <p>Acede à plataforma para completar a verificação de identidade e começar a transacionar de forma segura e rápida.</p>`;
            }
        }

        if (!bodyHtml) {
            console.warn(`⚠️ [NOTIFICAÇÕES] Notificação de e-mail ${notification.id} não possui corpo de mensagem legível.`);
            await supabase
                .from('notifications')
                .update({ status: 'failed', sent_at: new Date().toISOString() })
                .eq('id', notification.id);
            return;
        }

        const htmlEmail = buildEmailTemplate(subject, bodyHtml, "Aceder à Plataforma", "https://bridge-market-delta.vercel.app");
        const success = await sendEmailNotification(email, subject, htmlEmail, subject);

        await supabase
            .from('notifications')
            .update({ 
                status: success ? 'sent' : 'failed', 
                sent_at: new Date().toISOString() 
            })
            .eq('id', notification.id);

        console.log(`✅ [NOTIFICAÇÕES] E-mail ${success ? 'enviado' : 'falhado'} para ${email} (Notificação: ${notification.id}).`);
        return;
    }

    // ──────────────── PROCESSAMENTO DE WHATSAPP ────────────────
    let phone = null;

    // 1. Resolver o telefone de destino de forma inteligente
    if (notification.recipient_phone) {
        phone = notification.recipient_phone.replace(/\D/g, '');
    } else if (notification.destination && /^\+?\d+$/.test(notification.destination.replace(/[\s()-]/g, ''))) {
        phone = notification.destination.replace(/\D/g, '');
    }

    // Se ainda não temos o telefone, procuramos no perfil do utilizador associado
    if (!phone && notification.user_id) {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('phone')
                .eq('id', notification.user_id)
                .maybeSingle();
            if (profile && profile.phone) {
                phone = profile.phone.replace(/\D/g, '');
            }
        } catch (err) {
            console.error(`❌ [NOTIFICAÇÕES] Erro ao procurar telefone do utilizador ${notification.user_id}:`, err);
        }
    }

    // Se não for possível determinar nenhum telefone, a mensagem não pode ser entregue
    if (!phone) {
        console.warn(`⚠️ [NOTIFICAÇÕES] Sem telefone para a notificação ${notification.id}. Marcando como falhada.`);
        await supabase
            .from('notifications')
            .update({ status: 'failed', sent_at: new Date().toISOString() })
            .eq('id', notification.id);
        return;
    }

    // Formatar com o indicativo internacional de Angola se for de 9 dígitos
    if (phone.length === 9) {
        phone = '244' + phone;
    }

    let text = notification.message_body;

    // 2. Se o corpo estiver vazio, construímos com base no template e dados do pedido
    if (!text) {
        if (notification.template === 'new_order' && notification.order_id) {
            try {
                const { data: orderData } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', notification.order_id)
                    .maybeSingle();
                if (orderData) {
                    const orderRef = orderData.order_ref || '#' + orderData.id.slice(0, 8).toUpperCase();
                    text = `🛒 *NOVO PEDIDO (Bridge)*\n\nUm cliente acabou de criar um novo pedido!\n\n💵 Valor: *$${parseFloat(orderData.amount_usd).toFixed(2)}*\n🇦🇴 Total a Pagar: *${parseFloat(orderData.amount_aoa).toLocaleString('pt-AO')} Kz*\n📄 Referência: ${orderRef}\n🏦 Destino: ${orderData.destination_account}\n\n👉 Acede ao Painel de Administrador para gerir.`;
                }
            } catch (err) {
                console.error(`❌ [NOTIFICAÇÕES] Erro ao carregar dados do pedido para a notificação ${notification.id}:`, err);
            }
        } else if (notification.template === 'welcome') {
            text = `Bem-vindo ao Bridge Marketplace! A tua conta foi criada com sucesso. 🎉`;
        }
    }

    if (!text) {
        console.warn(`⚠️ [NOTIFICAÇÕES] Notificação ${notification.id} não possui corpo de mensagem legível.`);
        await supabase
            .from('notifications')
            .update({ status: 'failed', sent_at: new Date().toISOString() })
            .eq('id', notification.id);
        return;
    }

    // 3. Verificar se o cliente do WhatsApp está pronto
    if (!clientReady) {
        console.warn(`⚠️ [NOTIFICAÇÕES] Cliente WhatsApp não está conectado. Adiada notificação ${notification.id} para ${phone}.`);
        return;
    }

    try {
        await sendWhatsappMessage(phone, text);

        // Atualizar estado para enviado
        await supabase
            .from('notifications')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', notification.id);

        console.log(`✅ [NOTIFICAÇÕES] Mensagem WhatsApp enviada para ${phone} e estado actualizado para 'sent'.`);
    } catch (err) {
        console.error(`❌ [NOTIFICAÇÕES] Erro ao enviar WhatsApp na notificação ${notification.id}:`, err.message);
        await supabase
            .from('notifications')
            .update({ status: 'failed', sent_at: new Date().toISOString() })
            .eq('id', notification.id);
    }
}

// Verifica o backlog de notificações no banco de dados e processa-as em lotes
async function pollPendingNotifications() {
    if (!clientReady) return;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(10); // Processar em lotes controlados para evitar inundar a rede

        if (error) {
            console.error('❌ [NOTIFICAÇÕES] Erro ao puxar notificações pendentes:', error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log(`🧹 [NOTIFICAÇÕES] A processar backlog de ${data.length} mensagens pendentes...`);
            for (const notif of data) {
                await processNotification(notif);
                // Pausa suave de 1.5s entre envios para protecção contra banimento de SPAM
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    } catch (err) {
        console.error('❌ [NOTIFICAÇÕES] Erro no ciclo de varredura:', err.message);
    }
}

// Iniciar a subscrição realtime de notificações para envios instantâneos
supabase.channel('bot_realtime_notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
        await processNotification(payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, async (payload) => {
        if (payload.new.status === 'pending') {
            await processNotification(payload.new);
        }
    })
    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('✅ Canal Supabase Realtime de Notificações Ativo!');
        }
    });

// Configurar o loop de varredura periódica como fallback e processador de backlog
whatsappClient.on('ready', () => {
    // Varre a cada 15 segundos
    setInterval(pollPendingNotifications, 15000);
    // Executa uma varredura inicial em backlog após 4 segundos de conexão
    setTimeout(pollPendingNotifications, 4000);
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

// ── RETRY COM BACKOFF EXPONENCIAL PARA O GEMINI ───────────────────────────────
// O Gemini retorna 503 em picos de procura. Em vez de desistir, tenta até 3x
// com espera crescente: 2s → 4s → 8s.
async function geminiWithRetry(chat, promptPayload, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await chat.sendMessage(promptPayload);
        } catch (err) {
            lastError = err;
            const isRetryable = err.status === 503 || err.status === 429 ||
                (err.message && (err.message.includes('503') || err.message.includes('overload') ||
                err.message.includes('high demand') || err.message.includes('Service Unavailable')));

            if (!isRetryable || attempt === maxRetries) throw err;

            const waitMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.warn(`⚠️ [Gemini] Tentativa ${attempt}/${maxRetries} falhou (${err.status || 'erro'}). A aguardar ${waitMs / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }
    throw lastError;
}

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

        const result = await geminiWithRetry(chat, promptPayload);
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