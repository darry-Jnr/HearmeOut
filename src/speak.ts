// speak.ts
// Turns text into spoken voice.
//
// 1. ElevenLabs (great voice) if a key is set in .env
// 2. The browser's built-in speech synthesizer otherwise (always works)

import { showStatus } from "./ui";

const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const voiceId = (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string) || "21m00Tcm4TlvDq8ikWAM";

export async function speak(text: string) {
  if (!text) return;

  // Path 1: ElevenLabs (needs the API key, and an internet connection).
  if (elevenLabsKey) {
    try {
      const audio = await elevenLabsAudio(text);
      if (audio) {
        audio.play();
        return;
      }
    } catch {
      // Fall through to the browser voice if ElevenLabs fails.
    }
  }

  // Path 2: the free browser voice.
  speakWithBrowser(text);
}

// Ask ElevenLabs for an audio clip of `text`.
async function elevenLabsAudio(text: string): Promise<HTMLAudioElement | null> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
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
    }
  );

  if (!response.ok) {
    showStatus(`ElevenLabs error ${response.status} — using browser voice`, "error");
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
