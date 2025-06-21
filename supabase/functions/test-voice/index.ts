
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voiceId, provider = 'openai', apiKey } = await req.json();

    console.log('Test voice request received:', {
      textLength: text?.length,
      voiceId,
      provider,
      hasApiKey: !!apiKey
    });

    if (!text) {
      throw new Error('Text is required');
    }

    if (!apiKey) {
      throw new Error('API key is required for voice testing');
    }

    let response;

    if (provider === 'elevenlabs') {
      const defaultVoiceId = voiceId || 'pNInz6obpgDQGcFmaJgB';
      const defaultModelId = 'eleven_multilingual_v2';

      console.log(`Using ElevenLabs - Voice: ${defaultVoiceId}, Model: ${defaultModelId}`);

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
      // Default to OpenAI
      const defaultVoice = voiceId || 'alloy';
      console.log(`Using OpenAI - Voice: ${defaultVoice}`);

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

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} TTS API error (${response.status}): ${errorText}`);
      
      let errorMessage = `${provider} TTS API error`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.detail || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      throw new Error(errorMessage);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log(`Successfully generated audio - Size: ${audioBuffer.byteLength} bytes, Base64 length: ${base64Audio.length}`);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in test-voice function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
