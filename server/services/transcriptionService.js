require('dotenv').config();
const { AssemblyAI } = require('assemblyai');

async function transcribeWithAssemblyAI(filePath) {
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
  const transcript = await client.transcripts.transcribe({ audio: filePath });
  if (transcript.status === 'error') {
    throw new Error(`AssemblyAI Error: ${transcript.error}`);
  }
  return transcript.text || "(No speech detected.)";
}

async function transcribeWithGoogle(filePath) {
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  const client = new speech.SpeechClient();
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');
  const request = {
    audio: { content: audioBytes },
    config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'en-US' },
  };
  const [response] = await client.recognize(request);
  return response.results.map(r => r.alternatives[0].transcript).join('\n') || "(No speech detected.)";
}

async function transcribeAudio(filePath) {
  const provider = process.env.TRANSCRIPTION_PROVIDER;
  console.log(`🎙️ Using transcription provider: ${provider}`);
  switch (provider) {
    case 'ASSEMBLYAI': return transcribeWithAssemblyAI(filePath);
    case 'GOOGLE': return transcribeWithGoogle(filePath);
    default: return transcribeWithAssemblyAI(filePath);
  }
}
module.exports = { transcribeAudio };