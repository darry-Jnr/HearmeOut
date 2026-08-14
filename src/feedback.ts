// feedback.ts
// A self-contained "can the camera see your hand?" indicator.
// It renders a small status dot (green = tracking, amber = lost) and a hint
// message that explains WHY the hand is missing (too dark, moved out of
// frame, or just not there) — the way bigger apps do it.
//
// It owns all of its own HTML; the rest of the app only calls feed() once
// per frame and reset() when stopped.

export interface DetectionLike {
  gesture: string | null;
  score: number;
  handCount: number;
}

export interface HandFeedbackOptions {
  video: HTMLVideoElement;
}

// No hand for this long before we show a message.
const LOST_DELAY_MS = 2000;
// Average pixel brightness below this means the room is too dark.
const DARK_LEVEL = 28;
// How often we re-check brightness (sampling the whole frame every frame is wasteful).
const SAMPLE_EVERY_MS = 300;
// If a hand vanished this recently, it probably moved out of frame.
const RECENT_HAND_MS = 1500;

const DOT_BASE = "h-2.5 w-2.5 rounded-full transition-colors";
const DOT_TRACKING = "bg-emerald-400";
const DOT_LOST = "bg-amber-400";
const DOT_IDLE = "bg-neutral-500";

export function createHandFeedback(options: HandFeedbackOptions) {
  const root = document.createElement("div");
  root.className =
    "pointer-events-none absolute top-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2";

  const dot = document.createElement("span");
  dot.className = `${DOT_BASE} ${DOT_IDLE}`;

  const hint = document.createElement("span");
  hint.className =
    "hidden rounded-full bg-black/80 px-4 py-1 text-xs font-semibold text-white backdrop-blur-sm";

  root.append(dot, hint);
  document.querySelector("main")!.append(root);

  // A tiny off-screen canvas used to measure how dark the camera image is.
  const probe = document.createElement("canvas");
  probe.width = 8;
  probe.height = 8;
  const probeCtx = probe.getContext("2d", { willReadFrequently: true })!;

  let lastHandSeen = 0;
  let lostAt = 0;
  let shownFor = "";
  let lastSample = 0;
  let lastDark = false;

  function isDark(): boolean {
    const video = options.video;
    if (!video.videoWidth || !video.videoHeight) return false;

    const now = performance.now();
    if (now - lastSample < SAMPLE_EVERY_MS) return lastDark;
    lastSample = now;

    probeCtx.drawImage(video, 0, 0, 8, 8);
    const data = probeCtx.getImageData(0, 0, 8, 8).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    lastDark = sum / (data.length / 4) < DARK_LEVEL;
    return lastDark;
  }

  function message(): string {
    if (isDark()) return "Too dark — turn on a light";
    if (lastHandSeen && performance.now() - lastHandSeen < RECENT_HAND_MS) {
      return "Hand moved out of frame";
    }
    return "No hand detected — put your hand in view";
  }

  function show(msg: string) {
    const firstTime = shownFor === "";
    if (shownFor !== msg) {
      hint.textContent = msg;
      shownFor = msg;
    }
    if (firstTime) navigator.vibrate?.(60); // a single buzz gets attention
    hint.classList.remove("hidden");
  }

  function feed(detection: DetectionLike) {
    if (detection.handCount >= 1) {
      dot.className = `${DOT_BASE} ${DOT_TRACKING}`;
      hint.classList.add("hidden");
      lastHandSeen = performance.now();
      lostAt = 0;
      shownFor = "";
      return;
    }

    // No hand in view: start the "lost" state once, then show the message
    // only after the delay so it doesn't flash on and off.
    if (!lostAt) lostAt = performance.now();
    dot.className = `${DOT_BASE} ${DOT_LOST}`;
    if (performance.now() - lostAt >= LOST_DELAY_MS) show(message());
  }

  function reset() {
    dot.className = `${DOT_BASE} ${DOT_IDLE}`;
    hint.classList.add("hidden");
    lastHandSeen = 0;
    lostAt = 0;
    shownFor = "";
    lastDark = false;
  }

  return { feed, reset };
}
