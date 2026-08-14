// speak.ts
// Turns text into spoken voice.
//
// 1. Call our own /api/speak serverless function, which synthesizes the
//    audio with Microsoft's free Edge TTS (no key needed).
// 2. If that fails: fall back to the browser's free voice.

import { showStatus } from "./ui";

// Mute switches off ALL spoken output (still shows the text).
let muted = false;
export function setMuted(value: boolean) {
  muted = value;
  if (muted) window.speechSynthesis?.cancel();
}
export function isMuted() {
  return muted;
}

export async function speak(text: string) {
  if (!text || muted) return;

  try {
    const audio = await speakAudioViaProxy(text);

    if (audio) {
      await audio.play();
      return;
    }
  } catch {
    // Fall through to the browser voice on any failure.
  }

  speakWithBrowser(text);
}

// Through our serverless function, so no keys ever reach the browser.
async function speakAudioViaProxy(text: string): Promise<HTMLAudioElement | null> {
  const response = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return audioFromBlob(response);
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
