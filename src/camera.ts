// camera.ts
// Turns on the front (or first available) camera.

import { showStatus } from "./ui";

export async function startCamera(): Promise<HTMLVideoElement> {
  const video = document.querySelector<HTMLVideoElement>("#camera")!;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      // Prefer the front camera: the user signs toward themselves.
      facingMode: "user",
      width: { ideal: 960 },
      height: { ideal: 720 },
    },
    // We need the mic too, so we can capture what the hearing person says.
    audio: true,
  });

  video.srcObject = stream;
  await video.play();

  showStatus("Camera on — sign toward the camera");
  return video;
}
