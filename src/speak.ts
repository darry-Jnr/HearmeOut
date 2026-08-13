// speak.ts
// Turns text into spoken voice.
//
// 1. If a key is baked into the app (local dev): call ElevenLabs directly.
// 2. Otherwise (production): call our own /api/speak serverless function,
//    which holds the key on Vercel's server so it stays hidden.
// 3. If either fails: fall back to the browser's free voice.

import { showStatus } from "./ui";

// Only set in local dev (from .env). In production this stays empty,
// so the app automatically uses the /api/speak proxy instead.
const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const voiceId = (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string) || "21m00Tcm4TlvDq8ikWAM";

export async function speak(text: string) {
  if (!text) return;

  try {
    const audio = elevenLabsKey
      ? await elevenLabsAudioDirect(text) // dev: straight to ElevenLabs
      : await elevenLabsAudioViaProxy(text); // prod: through our server

    if (audio) {
      audio.play();
      return;
    }
  } catch {
    // Fall through to the browser voice on any failure.
  }

  speakWithBrowser(text);
}

// Direct call to ElevenLabs — used only in local dev.
async function elevenLabsAudioDirect(text: string): Promise<HTMLAudioElement | null> {
  return audioFromBlob(await elevenLabsFetch(text));
}

// Through our serverless function — used in production so the key stays hidden.
async function elevenLabsAudioViaProxy(text: string): Promise<HTMLAudioElement | null> {
  const response = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return audioFromBlob(response);
}

async function elevenLabsFetch(text: string): Promise<Response> {
  return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": elevenLabsKey!,
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_flash_v2_5",
    }),
  });
}

async function audioFromBlob(response: Response): Promise<HTMLAudioElement | null> {
  if (!response.ok) {
    showStatus(`Voice error ${response.status} — using browser voice`, "error");
    return null;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  return audio;
}

function speakWithBrowser(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}
