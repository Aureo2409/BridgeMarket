import { supabase } from './supabase'

export const testPaymentProviders = async (providerName) => {
  try {
    const { data, error } = await supabase.functions.invoke('visa-mastercard', {
      body: { provider: providerName } // 'visa' ou 'mastercard'
    })

    if (error) throw error

    console.log(`Resposta (${providerName}):`, data)
    return data
  } catch (err) {
    console.error('Erro ao chamar Edge Function:', err.message)
    throw err
  }
}