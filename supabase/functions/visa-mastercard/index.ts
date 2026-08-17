import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const visaApiKey = Deno.env.get('VISA_API_KEY')
    const mastercardConsumerKey = Deno.env.get('MASTERCARD_CONSUMER_KEY')

    const { provider } = await req.json()

    if (provider === 'visa') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Visa API integrada!',
          keyInjected: !!visaApiKey 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (provider === 'mastercard') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Mastercard API integrada!',
          keyInjected: !!mastercardConsumerKey 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Provedor inválido. Use visa ou mastercard.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})