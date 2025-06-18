
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioData, provider = 'openai' } = await req.json();

    if (!audioData) {
      throw new Error('Audio data is required');
    }

    console.log(`Processing speech-to-text with provider: ${provider}`);

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
    let endpoint = '';
    let formData = new FormData();

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
        throw new Error('ElevenLabs credentials not found. Please configure in Settings.');
      }

      apiKey = credentials.api_key;
      endpoint = 'https://api.elevenlabs.io/v1/speech-to-text';

      // Convert audio data for ElevenLabs
      const binaryAudio = processBase64Chunks(audioData);
      const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('audio', audioBlob, 'audio.webm');
    } else {
      // Default to OpenAI
      apiKey = Deno.env.get('OPENAI_API_KEY') || '';
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      endpoint = 'https://api.openai.com/v1/audio/transcriptions';

      // Convert audio data for OpenAI
      const binaryAudio = processBase64Chunks(audioData);
      const audioBlob = new Blob([binaryAudio], { type: 'audio/webm' });
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
    }

    console.log(`Making request to ${endpoint}`);

    // Call the speech-to-text API
    const headers: Record<string, string> = {};
    
    if (provider === 'elevenlabs') {
      headers['xi-api-key'] = apiKey;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${errorText}`);
      throw new Error(`${provider} API error: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Transcription result:`, result);

    return new Response(
      JSON.stringify({ text: result.text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in speech-to-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
