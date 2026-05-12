const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 1. Inicializa o cliente de IA com a tua chave API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1.5. Inicializa o Supabase (usa as mesmas variáveis do teu projeto Frontend)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Define o Prompt de Persona Baseado no teu Design System
const systemInstruction = `
Papel e Identidade:
És o assistente virtual da Pixel Flex, chamado "Responda", uma plataforma focada em segurança digital e transformação tecnológica. O teu tom de voz deve refletir a nossa interface de utilizador: minimalista, profissional, objetivo e altamente moderno. Não sejas excessivamente coloquial, mas sê sempre educado, claro e eficiente. Usa mensagens curtas e bem formatadas.

Diretrizes de Resposta:
- Clareza e Estrutura: Usa parágrafos curtos. Organiza a informação em tópicos ou listas sempre que o utilizador perguntar sobre múltiplos serviços ou dados.
- Uso de Emojis: Mantém o minimalismo visual. Usa apenas emojis que remetam a tecnologia, crescimento e aprovação (ex: 🟢, 📊, 💻, 🔒, 📱). Evita excessos.
- Concisão: Vai direto ao ponto. Tal como uma dashboard financeira, entrega o "Net Worth" (o valor principal da resposta) logo no primeiro parágrafo.

Contexto Operacional e Contactos da Empresa (Apenas fornecer se for contextualmente relevante para a pergunta do utilizador):
- Escritório: Localizado em Luanda, junto ao Estádio 11 de Novembro, Bairro Sapo 2.
- Atendimento Direto / Suporte: Linha 52 340023.
- Contacto Rápido WhatsApp: 976-34-42-07.
- Missão Principal: Segurança digital e transformação no ecossistema Google.

Comportamento em Situações de Dúvida:
Se o utilizador solicitar uma operação complexa que não possas processar diretamente pelo WhatsApp, responde indicando que a ação requer autenticação, orientando-o educadamente para o painel principal da plataforma ou oferecendo a transferência para o atendimento direto no número 52 340023.
`;

// 3. Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth() // Salva a sessão localmente para não precisares de ler o QR sempre
});

// Mostra o QR Code no terminal para emparelhar com o WhatsApp
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Faz a leitura do QR Code acima com o teu WhatsApp para conectar o bot "Responda".');
});

client.on('ready', () => {
    console.log('🟢 Bot "Responda" da Pixel Flex está online e pronto para receber mensagens!');
});

// 4. Configuração do modelo e estrutura de memória
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction,
});

// Utiliza um Map para guardar as sessões de chat de cada utilizador
const userChats = new Map();

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

        // Envia a mensagem dentro da sessão (que retém o contexto)
        const result = await chat.sendMessage(msg.body);
        msg.reply(result.response.text());

        // Guarda o histórico atualizado no Supabase (faz Update ou Insert)
        const updatedHistory = await chat.getHistory();
        await supabase
            .from('bot_history')
            .upsert({ phone: msg.from, history: updatedHistory }, { onConflict: 'phone' });
    } catch (error) {
        console.error('Erro na integração com a IA:', error);
        msg.reply('🔒 Ocorreu uma interrupção inesperada nos nossos sistemas. Por favor, tente novamente em instantes ou contacte a linha de suporte direto no número 52 340023.');
    }
});

client.initialize();