// translate.ts
// Turns the 7 recognized gestures into spoken words, and makes sure a
// gesture is held for a moment before we speak it (so one sign = one word).

import type { Detection, GestureName } from "./vision";

// Feel free to change what each gesture says.
export const GESTURE_TO_WORD: Record<GestureName, string> = {
  Open_Palm: "Hello!",
  Thumb_Up: "Yes",
  Thumb_Down: "No",
  Victory: "Victory!",
  Pointing_Up: "Excuse me!",
  Closed_Fist: "Stop!",
  ILoveYou: "I love you!",
};

// How long a gesture must be held before it is spoken.
const HOLD_MS = 700;
// How sure the model must be (0..1).
const SCORE_THRESHOLD = 0.6;

// Tracks what the camera is currently seeing and fires `onPhrase`
// whenever the user holds a new sign long enough.
export function phraseTracker(onPhrase: (word: string) => void) {
  let currentGesture: GestureName | null = null;
  let heldSince = 0;
  let lastSpoken: GestureName | null = null;
  let liveWord = "";

  return {
    feed(detection: Detection) {
      const g = detection.gesture;

      // No hand in view (or unsure): reset the hold timer.
      if (!g || detection.score < SCORE_THRESHOLD) {
        currentGesture = null;
        return;
      }

      // The gesture changed: start counting the hold time from now.
      if (g !== currentGesture) {
        currentGesture = g;
        heldSince = performance.now();
        return;
      }

      // Same gesture held long enough and not already spoken: speak it.
      const heldMs = performance.now() - heldSince;
      if (heldMs >= HOLD_MS && g !== lastSpoken) {
        lastSpoken = g;
        const word = GESTURE_TO_WORD[g];
        liveWord = word;
        onPhrase(word);
      }
    },

    // The word currently showing on screen (so the UI can display it).
    get liveWord() {
      return liveWord;
    },
  };
}
