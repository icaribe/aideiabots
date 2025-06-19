
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voiceId, provider = 'openai', modelId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Processing text-to-speech with provider: ${provider}, voice: ${voiceId}`);

    // Get user's credentials
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let apiKey = '';
    let response;

    if (provider === 'elevenlabs') {
      // Find ElevenLabs credentials
      const { data: credentials, error: credError } = await supabase
        .from('provider_credentials')
        .select('api_key')
        .eq('user_id', user.id)
        .eq('provider_type', 'voice')
        .eq('provider_id', 'elevenlabs')
        .single();

      if (credError || !credentials) {
        console.error('ElevenLabs credentials error:', credError);
        throw new Error('ElevenLabs credentials not found. Please configure in Settings.');
      }

      apiKey = credentials.api_key;
      const defaultVoiceId = voiceId || 'pNInz6obpgDQGcFmaJgB'; // Default Adam voice
      const defaultModelId = modelId || 'eleven_multilingual_v2';

      console.log(`Using ElevenLabs voice: ${defaultVoiceId}, model: ${defaultModelId}`);

      // Call ElevenLabs TTS API
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${defaultVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: defaultModelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });
    } else {
      // Use OpenAI - check for user credentials first
      console.log('Looking for OpenAI credentials for user:', user.id);
      
      // Try to get user credentials - handle the case where no records exist
      const { data: credentials, error: credError } = await supabase
        .from('provider_credentials')
        .select('api_key')
        .eq('user_id', user.id)
        .eq('provider_type', 'voice')
        .eq('provider_id', 'openai')
        .maybeSingle(); // Use maybeSingle instead of single to handle no records

      if (credError) {
        console.error('Error fetching OpenAI credentials:', credError);
        throw new Error(`Database error: ${credError.message}`);
      }

      if (credentials && credentials.api_key) {
        apiKey = credentials.api_key;
        console.log('Using user OpenAI credentials');
      } else {
        // Fallback to environment variable
        apiKey = Deno.env.get('OPENAI_API_KEY') || '';
        console.log('No user credentials found, trying environment OpenAI credentials');
      }

      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please configure in Settings or contact support.');
      }

      const defaultVoice = voiceId || 'alloy';
      console.log(`Using OpenAI voice: ${defaultVoice}`);

      // Call OpenAI TTS API
      response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: defaultVoice,
          response_format: 'mp3',
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} TTS API error: ${errorText}`);
      throw new Error(`${provider} TTS API error: ${errorText}`);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log(`Successfully generated audio, size: ${audioBuffer.byteLength} bytes`);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
