# HearMe Out

A hackathon proof-of-concept: sign toward the camera and the app speaks your
words out loud. When the other person replies, their words appear as captions.
No typing, no buttons, no backend — it all runs in your browser.

> Honest scope: this prototype recognizes a starter set of hand gestures
> (hello, yes, no, I love you, etc.), not full ASL. It proves the loop
> "sign → spoken voice → spoken reply → captions" works on a phone.

## Try it

```bash
npm install
npm run dev          # open the printed URL in Chrome
```

Press **Start**, allow camera + microphone, then sign toward the camera.

- Hold a gesture for ~1 second to make it speak.
- The colored buttons below always work (backup if the AI misses a sign).
- The hearing person's speech appears under "They said".

### Voice

- **Local dev:** if `.env` has `VITE_ELEVENLABS_API_KEY`, the browser calls
  ElevenLabs directly.
- **Production (Vercel):** no key ships in the app. `src/speak.ts` calls the
  serverless function in `api/speak.ts`, which holds the key on the server and
  never sends it to the browser.
- If ElevenLabs is unavailable, the free browser voice is used.

> Never commit your `.env` file. If your key leaks, rotate it in ElevenLabs.

### Deploying to Vercel (free)

1. Push this repo to GitHub.
2. vercel.com → Add New Project → import the repo (Vite is auto-detected).
3. Project → Settings → Environment Variables, add **server-side only**:
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID` (optional, default "21m00Tcm4TlvDq8ikWAM")
4. **Do NOT** add any `VITE_ELEVENLABS_*` variables — that would bake the key
   into the public JavaScript bundle.
5. Deploy. The URL is HTTPS, so the phone camera works.
   To test the proxy locally, use `vercel dev` instead of `vite`.

### Why a phone needs HTTPS

Cameras only work on `https://` (or `localhost`). Vercel gives you HTTPS for
free. Model + wasm files are already in `public/`, so no extra setup.

## How the code is organized

Each file does one job, in order:

| File | What it does |
| --- | --- |
| `src/main.ts` | Glue: starts the camera, model, and both directions of speech |
| `src/camera.ts` | Turns on the front camera |
| `src/vision.ts` | MediaPipe hand tracking + gesture recognition, draws the skeleton |
| `src/translate.ts` | Maps gestures to words, only speaks after you hold a sign |
| `src/speak.ts` | Speaks text (direct ElevenLabs in dev, `/api/speak` proxy in prod, else browser voice) |
| `src/listen.ts` | Transcribes the hearing person → captions |
| `src/ui.ts` | Small helpers for updating the page |
| `api/speak.ts` | Serverless function that calls ElevenLabs with the hidden key |

To change what a gesture says, edit `GESTURE_TO_WORD` in `src/translate.ts`.

## Hardware notes

- Cheap "smart glasses" (XREAL Air, Rokid) have no camera — they just mirror
  the phone screen. Set the phone on a small stand and sign toward it; the
  captions and video show up in the glasses.
- The whole pipeline is designed to also run on glasses that have cameras
  (Android XR) later — same web app, same URL.

## License

MIT. The MediaPipe gesture model and wasm files are Google's (Apache-2.0).
