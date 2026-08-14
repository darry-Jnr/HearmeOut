# HearMe Out 🖐️🗣️

**Sign your words and they speak out loud. Read the reply as it's captioned live.**

HearMe Out is an AI-powered, two-way communication bridge for Deaf and
hard-of-hearing people — and anyone who doesn't sign. Sign toward the camera
and the app speaks your words in a natural neural voice. When the other person
replies, their words appear as live captions. Everything runs in the browser,
on your phone. No install. No accounts. No keys.

[![Built with](https://img.shields.io/badge/AI-Google%20MediaPipe-%23428bff)](#)
[![Voice](https://img.shields.io/badge/Voice-Microsoft%20Edge%20TTS-%230078d4)](#)
[![Made with](https://img.shields.io/badge/Stack-Vite%20%2B%20TypeScript%20%2B%20Tailwind-%236463f1)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

---

## The problem

Not everyone knows sign language. A Deaf or hard-of-hearing person signs — and
the person in front of them can't understand. And when the other person replies
out loud, the Deaf person can't always read lips.

Most tools solve only **one half** of that conversation. HearMe Out bridges
**both directions** in a single app.

## How it works

1. **You sign or type** — the app recognizes the gesture instantly with an
   on-device AI model (Google MediaPipe hand tracking).
2. **It speaks for you** — your words are spoken out loud in a natural neural
   voice (Microsoft Edge TTS). No sign language knowledge needed from the
   other person.
3. **You read the reply** — the other person's speech appears as live captions
   (browser Speech Recognition).

## Key features

- ✋ **7 hand signs** — Hello, Yes, No, I love you, Victory, Excuse me, Stop
- 🗣️ **Neural AI voice** — free Edge TTS, no API key needed
- 💬 **Live captions** of the other person's speech (Chrome / Edge)
- ⌨️ **Type a message** when signing isn't possible
- 🔘 **Quick-phrase buttons** that always work, even if a sign is missed
- 🔒 **Privacy-first** — gestures are recognized on your device; no video is
  ever uploaded, no accounts, no keys
- 📱 **Works in the browser on a phone** — no install

> Scope: the recognition engine currently understands a starter set of hand
> gestures via an on-device MediaPipe model. It proves the full loop
> "sign → spoken voice → spoken reply → captions" on a phone, and the gesture
> set is easy to extend (see `src/translate.ts`).

## Live demo

> Add your deployed Vercel URL + a short demo video here before submitting.

- **Landing page:** `/`
- **App:** `/app`

## Run it locally

```bash
npm install
npm run dev        # open the printed URL in Chrome
```

Then open the app (the printed URL + `/app`), press **Start**, allow camera +
microphone, and sign toward the camera.

### Browser support

- Everything works in Chrome, Edge, Firefox and Safari.
- Live captions need Chrome or Edge (Safari and Firefox don't have that API yet).

### Controls

- **Start / Stop** — toggles the camera (white with ▶, red with ■).
- **Zoom (− / +)** — desktop only; phones pinch naturally.
- **Auto-speak my signs / Captions on** — toggle the two directions.
- **?** (desktop) — opens the in-app "how to use" docs.

### Voice

- Every phrase is spoken by Microsoft's free **Edge TTS** (neural AI voices,
  no API key or account needed).
- `src/speak.ts` calls the serverless function in `api/speak.ts`, which
  synthesizes the audio and streams MP3 back. No keys ever touch the browser.
- If the server is unreachable, the app falls back to the browser's own voice.

## Tech stack

| Layer | Technology |
| --- | --- |
| Gesture recognition | Google MediaPipe hand-tracking (on-device, ~21 landmarks) |
| Speech output | Microsoft Edge TTS neural voices (`api/speak.ts`) |
| Speech input (captions) | Browser Web Speech API |
| Frontend | Vite + TypeScript + Tailwind CSS |
| Hosting | Vercel (serverless function for TTS) |

## How the code is organized

Each file does one job:

| File | What it does |
| --- | --- |
| `index.html` | Landing page |
| `app.html` | The camera app (served at `/app`) |
| `src/main.ts` | Glue: starts the camera, model, and both directions of speech |
| `src/camera.ts` | Turns on the front camera |
| `src/vision.ts` | MediaPipe hand tracking + gesture recognition, draws the skeleton |
| `src/translate.ts` | Maps gestures to words, only speaks after you hold a sign |
| `src/speak.ts` | Speaks text via the `/api/speak` proxy, else the browser voice |
| `src/listen.ts` | Transcribes the hearing person → captions |
| `src/typeBox.ts` | The "Type a message" chat box |
| `src/controls.ts` | The bottom control row component |
| `src/docModal.ts` | The in-app documentation modal |
| `src/feedback.ts` | On-screen hand-status feedback |
| `src/zoom.ts` | Desktop camera zoom (− / + step control) |
| `src/ui.ts` | Small helpers for updating the page |
| `api/speak.ts` | Serverless function that synthesizes speech with Edge TTS |

To change what a gesture says, edit `GESTURE_TO_WORD` in `src/translate.ts`.

## Deploying to Vercel (free)

1. Push this repo to GitHub.
2. vercel.com → Add New Project → import the repo (Vite is auto-detected).
3. Deploy. The URL is HTTPS, so the phone camera works. No environment
   variables needed — there are no keys.

> Why HTTPS? Browsers only allow camera access on `https://` (or `localhost`).
> Vercel gives you HTTPS for free, and the model + wasm files are already in
> `public/`. Local dev already serves `/api/speak` via `vite.config.ts`, so
> `npm run dev` works standalone too.

## Extending

- **More signs:** add an entry to `GESTURE_TO_WORD` in `src/translate.ts`.
- **More voices:** pass a `voice` in the request body to `/api/speak`
  (Edge TTS supports dozens of languages).

## License

MIT. The MediaPipe gesture model and wasm files are Google's (Apache-2.0).
