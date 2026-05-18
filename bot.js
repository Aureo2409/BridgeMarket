import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
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

// 0.5. Rota para mostrar o QR Code na Web (Caso quebre no terminal)
let latestQR = "";
app.get('/qr', (req, res) => {
    if (!latestQR) {
        return res.send('<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">Nenhum QR Code disponível. O bot já está conectado ou ainda a iniciar!</h2>');
    }
    res.send(`
        <html>
            <head><title>Bridge - WhatsApp QR</title></head>
            <body style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background-color:#0f172a; color:white; font-family:sans-serif;">
                <h2>Abre o WhatsApp e faz a leitura:</h2>
                <div id="qrcode" style="background:white; padding:20px; border-radius:10px;"></div>
                <p style="color:#9ca3af; margin-top:20px;">A página atualiza sozinha a cada 15 segundos.</p>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                <script>
                    new QRCode(document.getElementById("qrcode"), {
                        text: "${latestQR}",
                        width: 300,
                        height: 300,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.L
                    });
                    setTimeout(() => location.reload(), 15000);
                </script>
            </body>
        </html>
    `);
});

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
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
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
Deves dar todas as tuas notícias, alertas e respostas SEMPRE e EXCLUSIVAMENTE em Português, independentemente do idioma em que o utilizador enviar a mensagem.

Papel e Identidade:
És o assistente virtual da Pixel Flex, chamado "Responda", uma plataforma focada em segurança digital e transformação tecnológica. O teu tom de voz deve refletir a nossa interface de utilizador: minimalista, profissional, objetivo e altamente moderno. Não sejas excessivamente coloquial, mas sê sempre educado, claro e eficiente. Usa mensagens curtas e bem formatadas.

Capacidades Visuais:
- Se o utilizador enviar um COMPROVATIVO: Identifica o valor, o banco e a data se visível. Confirma que a equipa administrativa vai validar o pagamento.
- Se o utilizador enviar um DOCUMENTO (ID): Informa que o KYC (Verificação de Identidade) deve ser feito obrigatoriamente no site por motivos de segurança (https://bridge-market-delta.vercel.app).

Diretrizes de Resposta:
- Clareza e Estrutura: Usa parágrafos curtos. Organiza a informação em tópicos ou listas sempre que o utilizador perguntar sobre múltiplos serviços ou dados.
- Uso de Emojis: Mantém o minimalismo visual. Usa apenas emojis que remetam a tecnologia, crescimento e aprovação (ex: 🟢, 📊, 💻, 🔒, 📱). Evita excessos.
- Concisão: Vai direto ao ponto. Tal como uma dashboard financeira, entrega o "Net Worth" (o valor principal da resposta) logo no primeiro parágrafo.

Contexto Operacional e Contactos da Empresa (Apenas fornecer se for contextualmente relevante para a pergunta do utilizador):
- Plataforma Oficial: https://bridge-market-delta.vercel.app (Orienta o cliente a aceder ao site para criar pedidos de dólares, simular taxas ou concluir o KYC).
- Escritório: Localizado em Luanda, junto ao Estádio 11 de Novembro, Bairro Sapo 2.
- Atendimento Direto / Suporte: Linha 52 340023.
- Contacto Rápido WhatsApp: 976-34-42-07.
- Missão Principal: Segurança digital e transformação no ecossistema Google.

Comportamento em Situações de Dúvida:
Se o utilizador solicitar uma compra de dólares, pedir o link da plataforma, ou tentar enviar documentos pelo WhatsApp, informa de forma educada que todo o processo é feito de forma automática e segura na nossa plataforma web (https://bridge-market-delta.vercel.app).
`;

// 3. Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(), // Salva a sessão localmente para não precisares de ler o QR sempre
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    },
    puppeteer: {
        headless: true, // Força o modo invisível para poupar recursos
        dumpio: false, // 🚨 DESLIGADO: Remove os erros "falsos" do Chromium (D-Bus, GCM) que poluem o terminal
        ...(process.platform === 'linux' ? { executablePath: '/usr/bin/chromium' } : {}), // Apenas usa no Linux
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ A carregar o WhatsApp no servidor:', percent, '%', message);
});

client.on('authenticated', () => {
    console.log('✅ Sessão anterior restaurada com sucesso!');
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação do WhatsApp:', msg);
});

// Mostra o QR Code no terminal para emparelhar com o WhatsApp
client.on('qr', (qr) => {
    latestQR = qr; // Guarda o QR code para ser mostrado na página web
    qrcode.generate(qr, { small: true }); // Tenta desenhar no terminal na mesma
    console.log('================================================================================');
    console.log('    ⚠️ NOVO QR CODE GERADO! ⚠️                                                    ');
    console.log('    Se o código acima estiver quebrado/distorcido, acede a:                     ');
    console.log('    👉 https://<O-TEU-DOMINIO-NO-RAILWAY>.up.railway.app/qr                     ');
    console.log('================================================================================');
});

client.on('ready', () => {
    latestQR = ""; // Limpa o QR da memória após conectar
    console.log('🟢 Bot "Responda" da Pixel Flex está online e pronto para receber mensagens!');

    // Vai buscar a taxa de câmbio inicial da plataforma
    supabase.from('exchange_rates').select('applied_rate').order('fetched_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
        if (data) currentRateStr = parseFloat(data.applied_rate).toLocaleString('pt-AO');
    });

    // O teu número de administrador para receber alertas (Formato: indicativo + número + @c.us)
    // Usa a variável de ambiente, ou o número de suporte por defeito
    const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER || '244976344207@c.us';

    // Escutar eventos de submissão de KYC no banco de dados em tempo real
    supabase.channel('bot_admin_alerts')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kyc_verifications' }, async (payload) => {
            const { new: newData, old: oldData } = payload;

            // 1. Dispara o alerta PARA O ADMIN quando o estado passa a "pending" (Aguardando Aprovação)
            if (newData.ocr_status === 'pending' && oldData.ocr_status !== 'pending') {
                const alertMsg = `🚨 *Nova Verificação de Identidade (KYC)*\n\nUm cliente acabou de submeter o seu vídeo e documento.\n\n👉 Acede ao Painel de Administrador para analisar e dar o teu veredicto (Aprovar/Rejeitar).`;
                client.sendMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar mensagem:', err));
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
                        const clientPhone = `${phone}@c.us`;
                        const clientName = profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente';

                        const isRegistered = await client.isRegisteredUser(clientPhone);
                        if (isRegistered) {
                            if (newData.ocr_status === 'passed') {
                                const msg = `🎉 *CONTA APROVADA*\n\nOlá ${clientName},\nA tua identidade foi verificada com sucesso! Já podes começar a fazer transações no Bridge Marketplace.\n\nAcede à plataforma para simular e criar o teu pedido.`;
                                client.sendMessage(clientPhone, msg).catch(err => console.error('Erro ao enviar aprovação:', err));
                            } else if (newData.ocr_status === 'rejected') {
                                const reason = newData.rejection_reason || "Documentos ilegíveis ou inválidos.";
                                const msg = `❌ *VERIFICAÇÃO RECUSADA*\n\nOlá ${clientName},\nInfelizmente, não foi possível validar a tua identidade.\n\n*Motivo:* ${reason}\n\nPor favor, acede à plataforma para tentares novamente submeter fotos mais nítidas.`;
                                client.sendMessage(clientPhone, msg).catch(err => console.error('Erro ao enviar rejeição:', err));
                            }
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

            client.sendMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de novo pedido:', err));
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payment_proofs' }, (payload) => {
            const alertMsg = `💰 *PAGAMENTO RECEBIDO (Bridge)*\n\nUm cliente acabou de enviar um comprovante de pagamento!\n\n👉 Acede ao teu Painel de Administrador para validar a transferência e confirmar o envio dos dólares.`;

            client.sendMessage(ADMIN_PHONE, alertMsg).catch(err => console.error('Erro ao enviar alerta de pagamento:', err));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, async (payload) => {
            const { new: newData, old: oldData } = payload;

            // Dispara quando clicas em "Confirmar envio do dólar" no painel
            if (newData.status === 'completed' && oldData.status !== 'completed') {
                try {
                    const { data: profile } = await supabase.from('profiles').select('phone, full_name').eq('id', newData.user_id).maybeSingle();

                    if (profile && profile.phone) {
                        let phone = profile.phone.replace(/\D/g, ''); // Limpa caracteres como + ou espaços
                        if (phone.length === 9) phone = '244' + phone; // Adiciona indicativo se faltar

                        const clientPhone = `${phone}@c.us`;
                        const orderRef = newData.order_ref || '#' + newData.id.slice(0, 8).toUpperCase();
                        const clientName = profile.full_name ? profile.full_name.split(' ')[0] : 'Cliente';

                        const isRegistered = await client.isRegisteredUser(clientPhone);
                        if (isRegistered) {
                            const msg = `✅ *PEDIDO ENVIADO*\n\nOlá ${clientName},\nO teu pedido ${orderRef} foi processado e os dólares já foram enviados para a tua conta!\n\n💵 Valor: *$${parseFloat(newData.amount_usd).toFixed(2)}*\n🏦 Destino: ${newData.destination_account}\n\nObrigado pela preferência! 🚀`;
                            client.sendMessage(clientPhone, msg).catch(err => console.error('Erro ao enviar mensagem ao cliente:', err));
                        }
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
                    if (phone.length === 9) phone = '244' + phone;

                    const isRegistered = await client.isRegisteredUser(`${phone}@c.us`);
                    await supabase.from('whatsapp_checks')
                        .update({ status: isRegistered ? 'valid' : 'invalid' }).eq('id', check.id);
                } catch (err) {
                    console.error('Erro na verificação do WhatsApp:', err);
                    await supabase.from('whatsapp_checks').update({ status: 'invalid' }).eq('id', check.id);
                }
            }
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('📡 Bot configurado para alertas e validação nativa de números de WhatsApp.');
            }
        });
});

// 4. Configuração do modelo e estrutura de memória
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Usar um modelo mais estável para evitar erros 503 de sobrecarga
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
async function prepareMediaForGemini(msg) {
    const media = await msg.downloadMedia();
    return {
        inlineData: {
            data: media.data,
            mimeType: media.mimetype
        }
    };
}

// 5. Lógica de resposta a mensagens
client.on('message', async (msg) => {
    // Ignorar status e mensagens de grupos
    if (msg.from === 'status@broadcast' || msg.from.includes('@g.us')) return;

    console.log(`Mensagem recebida de ${msg.from}: ${msg.body}`);

    try {
        // Verifica se já existe um chat ativo para este número
        let chat = userChats.get(msg.from);
        if (!chat) {
            // Tenta recuperar o histórico do banco de dados (Supabase)
            const { data, error } = await supabase
                .from('bot_history')
                .select('history')
                .eq('phone', msg.from)
                .maybeSingle();

            const previousHistory = data?.history || [];

            chat = model.startChat({ history: previousHistory });
            userChats.set(msg.from, chat);
        }

        let promptPayload = [];

        // Tratar Imagem ou Ficheiro
        if (msg.hasMedia) {
            const mediaPart = await prepareMediaForGemini(msg);
            promptPayload.push(mediaPart);
            promptPayload.push(msg.body || "Analisa esta imagem/documento e responde de acordo com as tuas instruções.");
        } else {
            // Tratar Texto com contexto de taxa
            let text = msg.body;
            if (/(taxa|câmbio|cambio|kwanza|kz|dólar|dolar|usd|aoa|preço|valor|custa|pagar)/i.test(text)) {
                text = `[INSTRUÇÃO DO SISTEMA (Apenas para tua referência, usa para responder ao cliente): A taxa de câmbio de hoje na Bridge é de ${currentRateStr} Kwanzas por cada 1 Dólar USD.]\n\nMensagem do cliente: ${text}`;
            }
            promptPayload.push(text);
        }

        // Envia a mensagem dentro da sessão (que retém o contexto)
        const result = await chat.sendMessage(promptPayload);
        msg.reply(result.response.text());

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
        msg.reply('🔒 Ocorreu uma interrupção inesperada nos nossos sistemas. Por favor, tente novamente em instantes ou contacte a linha de suporte direto no número 52 340023.');
    }
});

// 🚨 Proteção contra crashes silenciosos do Node.js
process.on('uncaughtException', err => console.error('🚨 [CRASH FATAL DO NODE]:', err));
process.on('unhandledRejection', err => console.error('🚨 [PROMESSA REJEITADA]:', err));

console.log('🚀 A inicializar o navegador do WhatsApp. Por favor, aguarde...');
client.initialize().catch(err => {
    console.error('❌ Erro crítico ao inicializar o bot:', err);
});