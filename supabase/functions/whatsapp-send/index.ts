
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { botId, phoneNumber, message } = await req.json();

    if (!botId || !phoneNumber || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get WhatsApp integration config
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('config')
      .eq('bot_id', botId)
      .eq('type', 'whatsapp')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      return new Response(JSON.stringify({ error: 'WhatsApp integration not found or inactive' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const config = integration.config;
    const accessToken = config.access_token;
    const phoneNumberId = config.phone_number_id;

    if (!accessToken || !phoneNumberId) {
      return new Response(JSON.stringify({ error: 'Missing WhatsApp credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Send message via WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error sending WhatsApp message:', result);
      return new Response(JSON.stringify({ error: 'Failed to send message', details: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('WhatsApp message sent successfully:', result);

    return new Response(JSON.stringify({ success: true, messageId: result.messages?.[0]?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in whatsapp-send:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
