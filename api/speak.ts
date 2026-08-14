// api/speak.ts
// A Vercel serverless function that turns text into speech.
//
// The phone calls THIS function, which synthesizes audio with Microsoft's
// free Edge TTS service (no API key needed). The client never talks to
// Microsoft directly.

import { EdgeTTS } from "edge-tts-universal";

export default async function handler(req: any, res: any) {
  const text = req.body?.text;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "missing text" });
  }

  const voice =
    typeof req.body?.voice === "string" ? req.body.voice : "en-US-AvaNeural";

  try {
    const tts = new EdgeTTS(text, voice);
    const result = await tts.synthesize();

    // Send the audio straight back to the phone.
    const audio = Buffer.from(await result.audio.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(audio);
  } catch (error) {
    return res.status(502).json({ error: "could not synthesize speech" });
  }
}
