const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 0. Servidor Web (Obrigatório para o Railway manter o Bot ligado)
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('🤖 Bot do WhatsApp está online e a funcionar!'));
app.listen(port, () => console.log(`🌐 Servidor web ativo na porta ${port}`));

// 1. Inicializa o cliente de IA com a tua chave API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1.5. Inicializa o Supabase (usa as mesmas variáveis do teu projeto Frontend)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Variável global para armazenar a taxa na memória do bot
let currentRateStr = "1165";

// 2. Define o Prompt de Persona Baseado no teu Design System
const systemInstruction = `
Papel e Identidade:
És o assistente virtual da Pixel Flex, chamado "Responda", uma plataforma focada em segurança digital e transformação tecnológica. O teu tom de voz deve refletir a nossa interface de utilizador: minimalista, profissional, objetivo e altamente moderno. Não sejas excessivamente coloquial, mas sê sempre educado, claro e eficiente. Usa mensagens curtas e bem formatadas.

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
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Essencial para rodar em servidores cloud/Linux sem crashar
    }
});

// Mostra o QR Code no terminal para emparelhar com o WhatsApp
client.on('qr', (qr) => {
    console.log('================================================================================');
    console.log('    ⚠️ ATENÇÃO: NÃO USES A CÂMARA NORMAL DO TELEMÓVEL! ⚠️                       ');
    console.log('                                                                                ');
    console.log('    1. Abre o link abaixo no navegador do teu computador.                       ');
    console.log('    2. No telemóvel, abre o WhatsApp > Dispositivos Associados.                 ');
    console.log('    3. Clica em "Conectar um aparelho" e aponta a câmara para o ecrã.           ');
    console.log('                                                                                ');
    console.log(`    🔗 LINK PARA O QR CODE: https://quickchart.io/qr?text=${encodeURIComponent(qr)}&size=400`);
    console.log('                                                                                ');
    console.log('================================================================================');
});

client.on('ready', () => {
    console.log('🟢 Bot "Responda" da Pixel Flex está online e pronto para receber mensagens!');

    // Vai buscar a taxa de câmbio inicial da plataforma
    supabase.from('exchange_rates').select('applied_rate').order('fetched_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
        if (data) currentRateStr = parseFloat(data.applied_rate).toLocaleString('pt-AO');
    });

    // O teu número de administrador para receber alertas (Formato: indicativo + número + @c.us)
    // Usa a variável de ambiente, ou o número de suporte por defeito
    const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER || '244952740023@c.us';

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
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
});

// Utiliza um Map para guardar as sessões de chat de cada utilizador
const userChats = new Map();

// Limpeza periódica a cada 24 horas para evitar vazamento de memória (Memory Leak)
setInterval(() => {
    userChats.clear();
    console.log('🧹 Cache de chats locais limpo para libertar memória do servidor.');
}, 24 * 60 * 60 * 1000);

// 5. Lógica de resposta a mensagens
client.on('message', async (msg) => {
    // Ignorar status e mensagens de grupos
    if (msg.from === 'status@broadcast' || msg.isGroup) return;

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

        // Injeta a taxa de câmbio silenciosamente caso a pergunta seja sobre valores/taxas
        let finalMessage = msg.body;
        if (/(taxa|câmbio|cambio|kwanza|kz|dólar|dolar|usd|aoa|preço|valor|custa|pagar)/i.test(msg.body)) {
            finalMessage = `[INSTRUÇÃO DO SISTEMA (Apenas para tua referência, usa para responder ao cliente): A taxa de câmbio de hoje na Bridge é de ${currentRateStr} Kwanzas por cada 1 Dólar USD.]\n\nMensagem do cliente: ${msg.body}`;
        }

        // Envia a mensagem dentro da sessão (que retém o contexto)
        const result = await chat.sendMessage(finalMessage);
        msg.reply(result.response.text());

        // Guarda o histórico atualizado no Supabase (faz Update ou Insert)
        const updatedHistory = await chat.getHistory();
        const { error: dbError } = await supabase
            .from('bot_history')
            .upsert({ phone: msg.from, history: updatedHistory }, { onConflict: 'phone' });

        if (dbError) {
            console.error('Erro ao guardar histórico no Supabase:', dbError);
        }
    } catch (error) {
        console.error('Erro na integração com a IA:', error);
        msg.reply('🔒 Ocorreu uma interrupção inesperada nos nossos sistemas. Por favor, tente novamente em instantes ou contacte a linha de suporte direto no número 52 340023.');
    }
});

client.initialize();