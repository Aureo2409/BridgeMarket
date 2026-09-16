import { supabase, sb } from '../lib/supabase.js';
import { PAYMENT_METHODS } from '../lib/constants.js';

const client = supabase || sb;

/**
 * Processa ou valida transação de pagamento/liquidação através do gateway configurado
 * @param {string} providerKey - id do método (ex: 'visa', 'mastercard', 'binance', 'redotpay', 'airtm')
 * @param {object} payload - dados da transação ({ amount, currency, account, orderId, ... })
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
export async function processTransaction(providerKey, payload = {}) {
  try {
    const method = PAYMENT_METHODS[providerKey] || { id: providerKey, functionEndpoint: 'test-payment-gateway' };
    const endpoint = method.functionEndpoint || 'test-payment-gateway';

    const { data, error } = await client.functions.invoke(endpoint, {
      body: {
        provider: providerKey,
        amount: payload.amount,
        currency: payload.currency,
        accountDetails: payload.account || payload.accountDetails,
        orderId: payload.orderId
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(`Erro ao processar ${providerKey}:`, err);
    return { success: false, message: err.message || 'Erro ao processar transação' };
  }
}

export default {
  processTransaction
};
