
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

    const body = await req.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Verify webhook (WhatsApp sends a GET request for verification)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === 'whatsapp_webhook_token') {
        console.log('Webhook verified successfully');
        return new Response(challenge, { status: 200 });
      } else {
        console.log('Webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Process incoming messages
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      for (const change of body.entry[0].changes) {
        if (change.value && change.value.messages) {
          for (const message of change.value.messages) {
            await processWhatsAppMessage(supabase, message, change.value);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function processWhatsAppMessage(supabase: any, message: any, value: any) {
  try {
    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const messageType = message.type;

    console.log(`Processing message from ${phoneNumber}: ${messageText}`);

    // Find or create WhatsApp session
    let { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*, bots(*)')
      .eq('phone_number', phoneNumber)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Error fetching session:', sessionError);
      return;
    }

    // If no session exists, we need to find a default bot or create a session
    if (!session) {
      // For now, we'll need to implement bot selection logic
      // This could be based on business phone number or other criteria
      console.log('No session found for phone number:', phoneNumber);
      return;
    }

    // Find or create conversation
    let conversationId = session.conversation_id;
    
    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          bot_id: session.bot_id,
          user_id: session.bot_id, // Using bot_id as user_id for WhatsApp sessions
          title: `WhatsApp - ${phoneNumber}`
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return;
      }

      conversationId = newConversation.id;

      // Update session with conversation_id
      await supabase
        .from('whatsapp_sessions')
        .update({ 
          conversation_id: conversationId,
          last_activity: new Date().toISOString()
        })
        .eq('id', session.id);
    }

    // Save incoming message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: messageText,
        is_from_user: true,
        user_id: session.bot_id, // Using bot_id as user_id for WhatsApp
        bot_id: session.bot_id
      });

    if (messageError) {
      console.error('Error saving message:', messageError);
      return;
    }

    // Process message with bot
    const { data: response, error: chatError } = await supabase.functions.invoke('chat', {
      body: {
        botId: session.bot_id,
        message: messageText,
        conversationId: conversationId
      }
    });

    if (chatError) {
      console.error('Error processing chat:', chatError);
      return;
    }

    // Send response back to WhatsApp
    if (response && response.response) {
      await sendWhatsAppMessage(supabase, session.bot_id, phoneNumber, response.response);
    }

  } catch (error) {
    console.error('Error in processWhatsAppMessage:', error);
  }
}

async function sendWhatsAppMessage(supabase: any, botId: string, phoneNumber: string, message: string) {
  try {
    // Get WhatsApp credentials from integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('config')
      .eq('bot_id', botId)
      .eq('type', 'whatsapp')
      .eq('active', true)
      .single();

    if (integrationError || !integration) {
      console.error('WhatsApp integration not found or inactive:', integrationError);
      return;
    }

    const config = integration.config;
    const accessToken = config.access_token;
    const phoneNumberId = config.phone_number_id;

    if (!accessToken || !phoneNumberId) {
      console.error('Missing WhatsApp credentials');
      return;
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
      return;
    }

    console.log('WhatsApp message sent successfully:', result);

  } catch (error) {
    console.error('Error in sendWhatsAppMessage:', error);
  }
}
