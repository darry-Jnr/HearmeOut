// listen.ts
// Uses the browser's speech-to-text to capture what the hearing person
// says, then shows it as live captions.
//
// Works in Chrome, Edge and Android. (Safari does not support this API yet.)

import { setTheySaid, showStatus } from "./ui";

let recognition: any = null;
let enabled = true;

export function isListeningSupported(): boolean {
  return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function setListenEnabled(on: boolean) {
  enabled = on;
  if (!on) setTheySaid("");
}

// Stop transcribing. (onend will see `enabled` is false and not restart.)
export function stopListening() {
  setListenEnabled(false);
  recognition?.stop();
  recognition = null;
}

export function startListening() {
  if (!isListeningSupported()) {
    showStatus("This browser can't transcribe speech — try Chrome.", "error");
    return;
  }

  enabled = true;
  const SpeechRecognitionCtor = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognitionCtor();
  recognition.lang = "en-US";
  recognition.continuous = true; // keep listening across pauses
  recognition.interimResults = true; // show words before they're final

  recognition.onresult = (event: any) => {
    if (!enabled) return;
    // Join all heard words into one running caption.
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    setTheySaid(transcript);
  };

  recognition.onerror = () => {
    /* Keep quiet: Chrome sometimes errors then recovers. */
  };

  recognition.onend = () => {
    // Restart automatically so captions never stop mid-conversation.
    if (enabled) recognition?.start();
  };

  recognition.start();
}
