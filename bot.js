import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();

// 0. Servidor Web (Obrigatório para o Railway manter o Bot ligado)
import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Permite ler JSON no corpo dos pedidos (necessário para Webhooks e chamadas do site)

app.get('/', (req, res) => res.send('🤖 Bot do WhatsApp está online e a funcionar!'));

// --- WHATSAPP WEB CONTROLLER (CHROMIUM / HEADLESS BROWSER) ────────────────────
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let clientReady = false;

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
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

whatsappClient.on('qr', (qr) => {
    console.log('📌 [WHATSAPP WEB] Escaneia o código QR abaixo com o teu telemóvel para ligar o Bot:');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
    console.log('✅ [WHATSAPP WEB] Bot está totalmente conectado e pronto a enviar mensagens!');
    clientReady = true;
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ [WHATSAPP WEB] Falha na autenticação do WhatsApp Web:', msg);
});

whatsappClient.on('disconnected', (reason) => {
    console.log('⚠️ [WHATSAPP WEB] O Bot foi desligado/desconectado:', reason);
    clientReady = false;
});

// Ligar o Bot do WhatsApp Web
whatsappClient.initialize().catch(err => {
    console.error('❌ Erro ao inicializar o WhatsApp Web Client:', err);
});

// --- WHATSAPP CLOUD API ──────────────────────────────────────────────────────
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// 1. Rota de verificação do Webhook (exigida pela Meta)
app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
            console.log('✅ Webhook do WhatsApp verificado com sucesso!');
            res.status(200).send(challenge);
        } else {
            console.error('❌ Falha na verificação do Webhook do WhatsApp. Tokens não batem.');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(404);
    }
});

// 2. Rota para receber mensagens e eventos do WhatsApp
app.post('/api/whatsapp/webhook', async (req, res) => {
    const body = req.body;

    // Garante que é uma notificação do WhatsApp
    if (body.object === 'whatsapp_business_account') {
        const entry = body.entry && body.entry[0];
        const changes = entry.changes && entry.changes[0];
        const value = changes.value;
        const message = value.messages && value.messages[0];

        if (message) {
            const from = message.from; // Número do remetente (ex: 244976344207)
            const msg_body = message.text?.body;
            const hasMedia = message.type === 'image' || message.type === 'document';
            const mediaId = message.image?.id || message.document?.id;

            // Ignora mensagens sem texto ou multimédia relevante
            if (msg_body || hasMedia) {
                // Chama a função principal de processamento de mensagens
                await handleIncomingMessage({ from, body: msg_body, hasMedia, mediaId });
            }
        }
        res.sendStatus(200); // Responde OK para a Meta
    } else {
        // Se não for do WhatsApp, ignora
        res.sendStatus(404);
    }
});

// 3. Função para enviar mensagens (Usa whatsapp-web.js se pronto, senão tenta Cloud API de fallback)
async function sendWhatsappMessage(to, text) {
    const cleanTo = to.replace(/\D/g, '');
    
    if (clientReady) {
        try {
            const chatId = `${cleanTo}@c.us`;
            await whatsappClient.sendMessage(chatId, text);
            console.log(`✅ [whatsapp-web.js] Mensagem enviada para ${cleanTo}`);
            return;
        } catch (error) {
            console.error('❌ [whatsapp-web.js] Erro ao enviar mensagem, tentando Cloud API de fallback...', error);
        }
    }

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        console.log(`⚠️ [SIMULADO WHATSAPP] Para: ${cleanTo} | Mensagem: ${text}`);
        return;
    }
    try {
        await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanTo,
                text: { body: text }
            })
        });
        console.log(`✅ [Cloud API] Mensagem enviada para ${cleanTo}`);
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem pelo Cloud API:', error);
    }
}

// ── INTEGRAÇÃO DIDIT.ME ──────────────────────────────────────────────────────
const DIDIT_API_KEY = process.env.DIDIT_API_KEY || 'JGASXPZM3NXefP3h6qDrtveLCLnOM-VKGC9tSkmRbpw.';

// 1. Rota para gerar Sessão Segura (Chamada pelo Frontend de forma invisível)
app.post('/api/didit/session', async (req, res) => {
    const { user_id } = req.body;
    try {
        // Exemplo da chamada típica da API do DIDIt (Confirma apenas a URL base na doc oficial)
        const response = await fetch('https://api.didit.me/v1/session', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIDIT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vendor_data: user_id, // Enviamos o ID do cliente para reconhecê-lo no webhook depois
                callback_url: 'https://bridge-market-delta.vercel.app' // Para onde o cliente volta após aprovação
            })
        });

        if (!response.ok) throw new Error('Falha na comunicação com a API do DIDIt');
        const data = await response.json();

        // O DIDIt normalmente devolve o link da verificação sob a propriedade url ou session_url
        res.json({ session_url: data.url || data.session_url });
    } catch (error) {
        console.error('Erro na sessão DIDIt:', error);
        res.status(500).json({ error: 'Falha ao conectar com provedor de segurança DIDIt.' });
    }
});

// 2. Webhook que vai receber a decisão do DIDIt em background
app.post('/api/didit/webhook', async (req, res) => {
    const payload = req.body;
    console.log('🔔 Webhook DIDIt recebido:', payload);

    try {
        const userId = payload.vendor_data || payload.client_reference_id;
        const status = payload.status; // Pode vir como "Approved" ou "passed"

        if (userId) {
            const isApproved = (status === 'Approved' || status === 'passed' || status === 'completed');

            // ATUALIZAÇÃO MAGNÍFICA: Apenas alteramos o Supabase. 
            // O Listener em tempo real que já codaste vai apanhar isto e avisar o cliente por WhatsApp automaticamente! ✨
            await supabase.from('kyc_verifications').update({
                ocr_status: isApproved ? 'passed' : 'rejected',
                liveness_status: isApproved ? 'passed' : 'rejected',
                rejection_reason: isApproved ? null : (payload.reason || "Verificação por IA não aprovada.")
            }).eq('user_id', userId);
        }
        res.status(200).send('Webhook Processado com Sucesso');
    } catch (error) {
        console.error('Erro ao processar Webhook DIDIt:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
// ─────────────────────────────────────────────────────────────────────────────

app.listen(port, '0.0.0.0', () => console.log(`🌐 Servidor web ativo na porta ${port}`));

// 1. Inicializa o cliente de IA com a tua chave API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1.5. Inicializa o Supabase (usa as mesmas variáveis do teu projeto Frontend)
// 🚨 O Bot precisa de ler os dados de TODOS os clientes para alertar o Admin.
// Deve usar a SERVICE ROLE KEY para ignorar as regras de segurança (RLS).
// Forçamos o VITE_SUPABASE_URL para impedir que o bot leia um URL de Postgres (postgresql://) caso o Railway o injecte!
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://gexlmuclvadddhlbmgkl.supabase.co";
// Usamos o .trim() para garantir que removemos espaços invisíveis ao colar a chave no Railway!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : null;

if (!supabaseKey) {
    console.error("🚨 ERRO FATAL: Falta a variável SUPABASE_SERVICE_ROLE_KEY! O bot vai falhar a inicialização sem ela.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
        transport: WebSocket
    }
});

// Variável global para armazenar a taxa na memória do bot
let currentRateStr = "1165";

// 2. Define o Prompt de Persona Baseado no teu Design System
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

console.log('🟢 Bot da Bridge (Cloud API) está online e pronto para receber webhooks!');
// Vai buscar a taxa de câmbio inicial da plataforma
supabase.from('exchange_rates').select('applied_rate').order('fetched_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
    if (data) currentRateStr = parseFloat(data.applied_rate).toLocaleString('pt-AO');
});

// O teu número de administrador para receber alertas (Formato: indicativo + número)
const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER || '244976344207';

// ─── SCRIPT DE DIAGNÓSTICO DE REALTIME ──────────────────────────────────────
// Como ouvimos 5 tabelas de uma vez, se 1 falhar, todas falham. Isto descobre a culpada!
const tabelas = ['kyc_verifications', 'orders', 'payment_proofs', 'exchange_rates', 'whatsapp_checks'];
tabelas.forEach(tabela => {
    supabase.channel(`diag_${tabela}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tabela }, () => { })
        .subscribe(status => {
            if (status === 'CHANNEL_ERROR') {
                console.error(`🚨 CULPADO ENCONTRADO: A tabela '${tabela}' não existe na base de dados ou não está no Realtime!`);
            } else if (status === 'SUBSCRIBED') {
                console.log(`✅ Tabela '${tabela}' testada com sucesso.`);
            }
        });
});

// Escutar eventos de submissão de KYC no banco de dados em tempo real
supabase.channel('bot_admin_alerts')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kyc_verifications' }, async (payload) => {
        const { new: newData, old: oldData } = payload;

        // Protecção: Evita bugs se o Supabase não enviar o estado antigo
        if (!oldData || Object.keys(oldData).length === 0 || oldData.ocr_status === undefined) return;

        // 1. Dispara o alerta PARA O ADMIN quando o estado passa a "pending" (Aguardando Aprovação)
        if (newData.ocr_status === 'pending' && oldData.ocr_status !== 'pending') {
            const alertMsg = `🚨 *Nova Verificação de Identidade (KYC)*\n\nUm cliente acabou de submeter o seu vídeo e documento.\n\n👉 Acede ao Painel de Administrador para analisar e dar o teu veredicto (Aprovar/Rejeitar).`;
            sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar mensagem:', err));
        }

        // 2. Dispara o alerta PARA O CLIENTE quando o Admin Aprova ou Rejeita
        if (
            (newData.ocr_status === 'passed' && oldData.ocr_status !== 'passed') ||
            (newData.ocr_status === 'rejected' && oldData.ocr_status !== 'rejected')
        ) {
            try {
                const { data: profile } = await supabase.from('profiles').select('phone, full_name').eq('id', newData.user_id).maybeSingle();
                if (profile && profile.phone) {
                    let phone = profile.phone.replace(/\D/g, ''); // Limpa a formatação
                    if (phone.length === 9) phone = '244' + phone; // Adiciona indicativo se não tiver
                    const clientName = profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente';

                    if (newData.ocr_status === 'passed') {
                        const msg = `🎉 *CONTA APROVADA*\n\nOlá ${clientName},\nA tua identidade foi verificada com sucesso! Já podes começar a fazer transações no Bridge Marketplace.\n\nAcede à plataforma para simular e criar o teu pedido.`;
                        sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar aprovação:', err));
                    } else if (newData.ocr_status === 'rejected') {
                        const reason = newData.rejection_reason || "Documentos ilegíveis ou inválidos.";
                        const msg = `❌ *VERIFICAÇÃO RECUSADA*\n\nOlá ${clientName},\nInfelizmente, não foi possível validar a tua identidade.\n\n*Motivo:* ${reason}\n\nPor favor, acede à plataforma para tentares novamente submeter fotos mais nítidas.`;
                        sendWhatsappMessage(phone, msg).catch(err => console.error('Erro ao enviar rejeição:', err));
                    }
                }
            } catch (error) {
                console.error('Erro ao alertar cliente sobre KYC:', error);
            }
        }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        const orderRef = newOrder.order_ref || '#' + newOrder.id.slice(0, 8).toUpperCase();
        const alertMsg = `🛒 *NOVO PEDIDO (Bridge)*\n\nUm cliente acabou de criar um novo pedido!\n\n💵 Valor: *$${parseFloat(newOrder.amount_usd).toFixed(2)}*\n🇦🇴 Total a Pagar: *${parseFloat(newOrder.amount_aoa).toLocaleString('pt-AO')} Kz*\n📄 Referência: ${orderRef}\n🏦 Destino: ${newOrder.destination_account}\n\n👉 Acede ao Painel de Administrador para gerir.`;

        sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de novo pedido:', err));
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payment_proofs' }, (payload) => {
        const alertMsg = `💰 *PAGAMENTO RECEBIDO (Bridge)*\n\nUm cliente acabou de enviar um comprovante de pagamento!\n\n👉 Acede ao teu Painel de Administrador para validar a transferência e confirmar o envio dos dólares.`;

        sendWhatsappMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de pagamento:', err));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, async (payload) => {
        const { new: newData, old: oldData } = payload;

        // Protecção: Evita disparos múltiplos e crash
        if (!oldData || Object.keys(oldData).length === 0 || oldData.status === undefined) return;

        // Dispara quando clicas em "Confirmar envio do dólar" no painel
        if (newData.status === 'completed' && oldData.status !== 'completed') {
            try {
                const { data: profile } = await supabase.from('profiles').select('phone, full_name').eq('id', newData.user_id).maybeSingle();

                if (profile && profile.phone) {
                    let phone = profile.phone.replace(/\D/g, ''); // Limpa caracteres como + ou espaços
                    if (phone.length === 9) phone = '244' + phone; // Adiciona indicativo se faltar

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
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exchange_rates' }, (payload) => {
        // Atualiza a taxa de câmbio na memória do bot sempre que tu a publicares no Painel de Admin
        currentRateStr = parseFloat(payload.new.applied_rate).toLocaleString('pt-AO');
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_checks' }, async (payload) => {
        const check = payload.new;
        console.log(`🔍 A verificar conta de WhatsApp do número: ${check.phone}`);
        if (check.status === 'pending') {
            try {
                let phone = check.phone.replace(/\D/g, '');
                if (!phone.startsWith('244')) phone = '244' + phone;

                // Usa a API de contactos da Meta para verificar o número
                const response = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/contacts`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "blocking": "wait", "contacts": [`+${phone}`] })
                });
                if (!response.ok) throw new Error(`A API de contactos falhou com o status: ${response.status}`);
                const data = await response.json();
                const contact = data.contacts[0];
                const isRegistered = contact.status === 'valid';

                await supabase.from('whatsapp_checks')
                    .update({ status: isRegistered ? 'valid' : 'invalid' }).eq('id', check.id);
            } catch (err) {
                console.error('Erro na verificação do WhatsApp:', err);
                // Em caso de erro com a API da Meta, marca como válido para não bloquear o utilizador
                await supabase.from('whatsapp_checks').update({ status: 'valid' }).eq('id', check.id);
            }
        }
    })
    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('📡 Bot configurado para alertas e validação nativa de números de WhatsApp.');
        } else {
            console.log('⚠️ Estado da subscrição Supabase:', status);
        }
    });
































































































































































































































































// 4. Configuração do modelo e estrutura de memória
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // 🚨 MUDANÇA AQUI: Usa o modelo mais recente que tem a cota gratuita ativada!
    systemInstruction: systemInstruction,
});

// Utiliza um Map para guardar as sessões de chat de cada utilizador
const userChats = new Map();

// Limpeza periódica a cada 24 horas para evitar vazamento de memória (Memory Leak)
setInterval(() => {
    userChats.clear();
    console.log('🧹 Cache de chats locais limpo para libertar memória do servidor.');
}, 24 * 60 * 60 * 1000);

// 4.5. Função para converter imagens/ficheiros do WhatsApp para a IA (Gemini Vision)
async function prepareMediaForGemini(mediaId) {
    try {
        // 1. Obter o URL do ficheiro a partir do ID
        const urlRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
        });
        const urlData = await urlRes.json();
        if (!urlData.url) throw new Error("Não foi possível obter o URL do ficheiro.");

        // 2. Descarregar o ficheiro
        const fileRes = await fetch(urlData.url, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
        });
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        return {
            inlineData: { data: base64Data, mimeType: fileRes.headers.get('content-type') }
        };
    } catch (error) {
        console.error("❌ Erro ao processar multimédia do WhatsApp:", error);
        return null;
    }
}

// 5. Lógica de resposta a mensagens
async function handleIncomingMessage(msg) {
    console.log(`Mensagem recebida de ${msg.from}: ${msg.body || '(Multimédia)'}`);

    try {
        // Verifica se já existe um chat ativo para este número
        let chat = userChats.get(msg.from);
        if (!chat) {
            // Tenta recuperar o histórico do banco de dados (Supabase)
            const { data, error } = await supabase
                .from('bot_history')
                .select('history') // O RLS garante que só podemos ler o nosso próprio histórico
                .eq('phone', msg.from)
                .maybeSingle();

            const previousHistory = data?.history || [];

            chat = model.startChat({ history: previousHistory });
            userChats.set(msg.from, chat);
        }

        let promptPayload = [];

        // Tratar Imagem ou Ficheiro
        if (msg.hasMedia && (msg.mediaId || msg.messageObj)) {
            let mediaPart = null;
            if (msg.messageObj) {
                try {
                    const media = await msg.messageObj.downloadMedia();
                    if (media) {
                        mediaPart = {
                            inlineData: { data: media.data, mimeType: media.mimetype }
                        };
                    }
                } catch (err) {
                    console.error("❌ [whatsapp-web.js] Erro ao descarregar media:", err);
                }
            } else if (msg.mediaId) {
                mediaPart = await prepareMediaForGemini(msg.mediaId);
            }

            if (mediaPart) {
                promptPayload.push(mediaPart);
                promptPayload.push(msg.body || "Analisa esta imagem/documento e responde de acordo com as tuas instruções.");
            } else {
                promptPayload.push("Ocorreu um erro ao tentar ler a imagem que enviaste. Podes tentar enviar novamente?");
            }
        } else {
            // Tratar Texto com contexto de taxa
            let text = msg.body || "";
            if (/(taxa|câmbio|cambio|kwanza|kz|dólar|dolar|usd|aoa|preço|valor|custa|pagar)/i.test(text)) {
                text = `[INSTRUÇÃO DO SISTEMA (Apenas para tua referência, usa para responder ao cliente): A taxa de câmbio de hoje na Bridge é de ${currentRateStr} Kwanzas por cada 1 Dólar USD.]\n\nMensagem do cliente: ${text}`;
            }
            promptPayload.push(text);
        }

        // Envia a mensagem dentro da sessão (que retém o contexto)
        const result = await chat.sendMessage(promptPayload);
        await sendWhatsappMessage(msg.from, result.response.text());

        // Guarda o histórico atualizado no Supabase (faz Update ou Insert)
        const updatedHistory = await chat.getHistory();
        const { error: dbError } = await supabase
            .from('bot_history')
            .upsert({ phone: msg.from, history: updatedHistory.slice(-16) }, { onConflict: 'phone' }); // Mantém apenas as últimas interações na DB

        if (dbError) {
            console.error('Erro ao guardar histórico no Supabase:', dbError);
        }
    } catch (error) {
        console.error('Erro na integração com a IA:', error);
        await sendWhatsappMessage(msg.from, '🔒 Ocorreu uma interrupção inesperada nos nossos sistemas. Por favor, tente novamente em instantes ou contacte a linha de suporte direto no número 976-344-207.');
    }
}

// 6. Conectar o Listener de Mensagens Recebidas do whatsapp-web.js
whatsappClient.on('message', async (message) => {
    // Ignorar mensagens de grupos ou transmissões
    if (message.from.endsWith('@g.us') || message.from.endsWith('@broadcast')) return;

    const from = message.from.replace('@c.us', '');
    const body = message.body;
    const hasMedia = message.hasMedia;

    await handleIncomingMessage({ from, body, hasMedia, messageObj: message });
});

// 🚨 Proteção contra crashes silenciosos do Node.js
process.on('uncaughtException', err => console.error('🚨 [CRASH FATAL DO NODE]:', err));
process.on('unhandledRejection', err => console.error('🚨 [PROMESSA REJEITADA]:', err));