// main.ts
// The glue: it connects the camera, the hand-tracking model, the
// speech output and the caption input. Read this top to bottom.

import "./style.css";

import { startCamera } from "./camera";
import { Vision } from "./vision";
import { phraseTracker } from "./translate";
import { speak } from "./speak";
import { startListening, setListenEnabled, isListeningSupported } from "./listen";
import { setYouSaid, setTheySaid, showStatus } from "./ui";

const startButton = document.querySelector<HTMLButtonElement>("#startBtn")!;
const autoSpeakToggle = document.querySelector<HTMLInputElement>("#autoSpeak")!;
const listenToggle = document.querySelector<HTMLInputElement>("#listenToggle")!;

let running = false;

async function startEverything() {
  if (running) return;
  running = true;
  startButton.disabled = true;
  startButton.textContent = "Starting…";

  try {
    // 1) Turn on the camera (asks the user for permission).
    const video = await startCamera();

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
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // 5) Start transcribing the hearing person's replies as captions.
    if (isListeningSupported()) {
      startListening();
    } else {
      showStatus("Captions unavailable in this browser — try Chrome.", "error");
    }

    startButton.textContent = "Running";
  } catch (err) {
    running = false;
    startButton.disabled = false;
    startButton.textContent = "Start";
    showStatus("Could not start: " + (err instanceof Error ? err.message : err), "error");
  }
}

startButton.addEventListener("click", startEverything);

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
