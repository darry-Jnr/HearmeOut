// main.ts
// The glue: it connects the camera, the hand-tracking model, the
// speech output and the caption input. Read this top to bottom.

import "./style.css";

import { startCamera, stopCamera } from "./camera";
import { Vision } from "./vision";
import { phraseTracker } from "./translate";
import { speak } from "./speak";
import {
  startListening,
  stopListening,
  setListenEnabled,
  isListeningSupported,
} from "./listen";
import { setYouSaid, setTheySaid, showStatus } from "./ui";
import { resetZoom } from "./zoom";

const startButton = document.querySelector<HTMLButtonElement>("#startBtn")!;
const autoSpeakToggle = document.querySelector<HTMLInputElement>("#autoSpeak")!;
const listenToggle = document.querySelector<HTMLInputElement>("#listenToggle")!;

// The "Type a message" box.
const typeBtn = document.querySelector<HTMLButtonElement>("#typeBtn")!;
const typeBox = document.querySelector<HTMLElement>("#typeBox")!;
const typeInput = document.querySelector<HTMLInputElement>("#typeInput")!;
const typeSend = document.querySelector<HTMLButtonElement>("#typeSend")!;
const typeCancel = document.querySelector<HTMLButtonElement>("#typeCancel")!;

function openTypeBox() {
  typeBox.classList.remove("hidden");
  typeBox.classList.add("flex");
  typeInput.focus();
}

function closeTypeBox() {
  typeBox.classList.add("hidden");
  typeBox.classList.remove("flex");
  typeInput.value = "";
}

function sendTypedMessage() {
  const text = typeInput.value.trim();
  if (!text) return;
  setYouSaid(text);
  speak(text);
  closeTypeBox();
}

typeBtn.addEventListener("click", openTypeBox);
typeCancel.addEventListener("click", closeTypeBox);
typeSend.addEventListener("click", sendTypedMessage);
typeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendTypedMessage();
});

let running = false;
let animationFrame = 0;

async function startEverything() {
  if (running) return;
  running = true;
  // Flip the button NOW (before the async camera/model work) so the user
  // always sees it change to "Stop". It only goes back to "Start" on error.
  startButton.disabled = true;
  startButton.textContent = "Stop";

  try {
    // 1) Turn on the camera (asks the user for permission).
    const video = await startCamera();
    resetZoom();

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
    startButton.textContent = "Start";
    showStatus("Could not start: " + (err instanceof Error ? err.message : err), "error");
  }
}

function stopEverything() {
  if (!running) return;
  running = false;

  cancelAnimationFrame(animationFrame);
  stopCamera();
  stopListening();

  setYouSaid("—");
  setTheySaid("");
  showStatus("Stopped");
  startButton.disabled = false;
  startButton.textContent = "Start";
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
