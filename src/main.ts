// main.ts
// The glue: it connects the camera, the hand-tracking model, the
// speech output and the caption input. Read this top to bottom.

import "./style.css";

import { startCamera, stopCamera } from "./camera";
import { Vision } from "./vision";
import { phraseTracker } from "./translate";
import { speak, setMuted, isMuted } from "./speak";
import {
  startListening,
  stopListening,
  setListenEnabled,
  isListeningSupported,
} from "./listen";
import { setYouSaid, setTheySaid, showStatus } from "./ui";
import { resetZoom } from "./zoom";
import { createTypeBox } from "./typeBox";
import { createHandFeedback } from "./feedback";

const startButton = document.querySelector<HTMLButtonElement>("#startBtn")!;
const startIcon = document.querySelector<HTMLImageElement>("#startIcon")!;
const muteBtn = document.querySelector<HTMLButtonElement>("#muteBtn")!;
const muteIcon = document.querySelector<HTMLImageElement>("#muteIcon")!;
const autoSpeakToggle = document.querySelector<HTMLInputElement>("#autoSpeak")!;
const listenToggle = document.querySelector<HTMLInputElement>("#listenToggle")!;

// Mute/unmute all spoken output (text still shows).
function renderMute() {
  const muted = isMuted();
  muteIcon.src = muted ? "/mute.png" : "/unmute.png";
  muteIcon.alt = muted ? "Muted" : "Sound on";
  muteBtn.classList.toggle("opacity-60", muted);
  muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
}

muteBtn.addEventListener("click", () => {
  setMuted(!isMuted());
  renderMute();
  showStatus(isMuted() ? "Sound muted" : "Sound on", isMuted() ? "error" : "info");
});
renderMute();

// The "Type a message" popup — a separate component that builds its own HTML.
const typeBtn = document.querySelector<HTMLButtonElement>("#typeBtn")!;
const typeBox = createTypeBox({
  onSend: (text) => {
    setYouSaid(text);
    speak(text);
  },
});
document.querySelector("main")!.append(typeBox.element);
typeBtn.addEventListener("click", typeBox.open);

let running = false;
let animationFrame = 0;
let handFeedback: ReturnType<typeof createHandFeedback> | null = null;

// Start = white with a play icon, Stop = red with a stop icon.
function setStartButton(label: "Start" | "Stop") {
  startButton.textContent = "";
  startIcon.src = label === "Start" ? "/start.png" : "/stop.png";
  startIcon.alt = label;
  startButton.append(startIcon, document.createTextNode(label));
  startButton.classList.toggle("bg-white", label === "Start");
  startButton.classList.toggle("text-black", label === "Start");
  startButton.classList.toggle("bg-red-500", label === "Stop");
  startButton.classList.toggle("text-white", label === "Stop");
}

async function startEverything() {
  if (running) return;
  running = true;
  // Flip the button NOW (before the async camera/model work) so the user
  // always sees it change to "Stop". It only goes back to "Start" on error.
  startButton.disabled = true;
  setStartButton("Stop");

  try {
    // 1) Turn on the camera (asks the user for permission).
    const video = await startCamera();
    resetZoom();
    if (!handFeedback) handFeedback = createHandFeedback({ video });

    // 2) Load the MediaPipe gesture model (downloads ~8 MB once).
    showStatus("Loading the sign recognition model…");
    const vision = new Vision();
    await vision.load();
    showStatus("Model ready!");

    // 3) Set up the "hold a sign → speak a word" logic.
    const tracker = phraseTracker((word) => {
      setYouSaid(word);
      if (autoSpeakToggle.checked) speak(word);
    });

    // 4) Loop forever: read each camera frame and look for a sign.
    const tick = () => {
      const detection = vision.detect(video);
      tracker.feed(detection);
      handFeedback?.feed(detection);
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);

    // 5) Start transcribing the hearing person's replies as captions.
    if (isListeningSupported()) {
      startListening();
    } else {
      showStatus("Captions unavailable in this browser — try Chrome.", "error");
    }

    startButton.disabled = false;
  } catch (err) {
    running = false;
    startButton.disabled = false;
    setStartButton("Start");
    showStatus("Could not start: " + (err instanceof Error ? err.message : err), "error");
  }
}

function stopEverything() {
  if (!running) return;
  running = false;

  cancelAnimationFrame(animationFrame);
  stopCamera();
  stopListening();
  handFeedback?.reset();

  setYouSaid("—");
  setTheySaid("");
  showStatus("Stopped");
  startButton.disabled = false;
  setStartButton("Start");
}

startButton.addEventListener("click", () => {
  if (running) {
    stopEverything();
  } else {
    startEverything();
  }
});

// The quick-phrase buttons always work, even if the model misses a sign.
document.querySelectorAll<HTMLButtonElement>("button[data-phrase]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const phrase = btn.dataset.phrase!;
    setYouSaid(phrase);
    speak(phrase);
  });
});

// Toggles: auto-speak your signs, and live captions of the other person.
listenToggle.addEventListener("change", () => setListenEnabled(listenToggle.checked));

// Show a blank caption if speech recognition isn't available, so the UI
// doesn't sit on an old transcript forever.
setTheySaid("");
