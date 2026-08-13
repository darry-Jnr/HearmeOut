// vision.ts
// Loads Google's MediaPipe GestureRecognizer and, for every camera frame,
// returns which gesture the person is making. It also draws the hand
// skeleton on top of the video so you can see it "seeing" your hands.

import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";

const MODEL_URL = "/models/gesture_recognizer.task";
const WASM_DIR = "/wasm"; // local copy of the MediaPipe wasm files

// The built-in model understands these 7 gestures.
// We translate them into spoken words in translate.ts.
export type GestureName =
  | "Closed_Fist"
  | "Open_Palm"
  | "Pointing_Up"
  | "Thumb_Down"
  | "Thumb_Up"
  | "Victory"
  | "ILoveYou";

export interface Detection {
  gesture: GestureName | null;
  score: number; // 0..1 how sure the model is
  handCount: number;
}

export class Vision {
  private recognizer: GestureRecognizer | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#overlay")!;
    this.ctx = this.canvas.getContext("2d")!;
  }

  // Load the model. Call once, before starting the loop.
  async load(): Promise<void> {
    const fileset = await FilesetResolver.forVisionTasks(WASM_DIR);

    try {
      // Most phones can run the model on the GPU (faster).
      this.recognizer = await this.build(fileset, "GPU");
    } catch {
      // Some phones can't — the CPU version always works, just a bit slower.
      this.recognizer = await this.build(fileset, "CPU");
    }
  }

  private build(fileset: any, delegate: "GPU" | "CPU") {
    return GestureRecognizer.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate,
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  // Analyze one video frame. Returns what gesture was seen.
  detect(video: HTMLVideoElement): Detection {
    if (!this.recognizer) return { gesture: null, score: 0, handCount: 0 };

    // Tell the canvas how big the video really is, once.
    if (this.canvas.width !== video.videoWidth) {
      this.canvas.width = video.videoWidth;
      this.canvas.height = video.videoHeight;
    }

    const result = this.recognizer.recognizeForVideo(video, performance.now());

    this.drawSkeleton(result.landmarks);

    const gesture = result.gestures?.[0]?.[0];
    return {
      gesture: (gesture?.categoryName as GestureName) ?? null,
      score: gesture?.score ?? 0,
      handCount: result.landmarks?.length ?? 0,
    };
  }

  // Draw little circles + lines on the canvas to show the hand skeleton.
  private drawSkeleton(handLandmarks: any[][] | undefined) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!handLandmarks) return;

    this.ctx.strokeStyle = "#4f8cff";
    this.ctx.lineWidth = 3;
    this.ctx.fillStyle = "#ffffff";

    for (const hand of handLandmarks) {
      // Lines that connect the 21 landmarks into a hand shape.
      const connections: Array<[number, number]> = [
        [0, 1], [1, 2], [2, 3], [3, 4],           // thumb
        [0, 5], [5, 6], [6, 7], [7, 8],           // index finger
        [5, 9], [9, 10], [10, 11], [11, 12],      // middle finger
        [9, 13], [13, 14], [14, 15], [15, 16],    // ring finger
        [13, 17], [17, 18], [18, 19], [19, 20],   // pinky
        [0, 17],                                  // wrist to pinky
      ];

      this.ctx.beginPath();
      for (const [from, to] of connections) {
        const a = hand[from];
        const b = hand[to];
        this.ctx.moveTo(a.x * this.canvas.width, a.y * this.canvas.height);
        this.ctx.lineTo(b.x * this.canvas.width, b.y * this.canvas.height);
      }
      this.ctx.stroke();

      // A dot at every landmark.
      for (const point of hand) {
        this.ctx.beginPath();
        this.ctx.arc(point.x * this.canvas.width, point.y * this.canvas.height, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}
