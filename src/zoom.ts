// zoom.ts
// A step-by-step camera zoom. Each press of − / + changes the zoom by one
// notch, so it never jumps all the way to the limit.
//
// It scales the #zoomLayer div (which holds both the video and the hand
// skeleton), so the skeleton stays glued to your hands at every zoom level.

const MIN_ZOOM = 0.5; // furthest out (face looks smaller)
const MAX_ZOOM = 2.0; // closest in
const STEP = 0.1; // one notch per press

const layer = document.querySelector<HTMLElement>("#zoomLayer")!;
const zoomOut = document.querySelector<HTMLButtonElement>("#zoomOut")!;
const zoomIn = document.querySelector<HTMLButtonElement>("#zoomIn")!;
const zoomValue = document.querySelector<HTMLElement>("#zoomValue")!;

let zoom = 1.0;

function applyZoom() {
  // The video/canvas are already mirrored inside the layer; only scale here.
  layer.style.transform = `scale(${zoom})`;
  zoomValue.textContent = zoom.toFixed(1) + "×";
}

export function changeZoom(delta: number) {
  zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((zoom + delta) * 10) / 10));
  applyZoom();
}

// Start back at normal zoom whenever the camera is restarted.
export function resetZoom() {
  zoom = 1.0;
  applyZoom();
}

zoomOut.addEventListener("click", () => changeZoom(-STEP));
zoomIn.addEventListener("click", () => changeZoom(STEP));

applyZoom();
