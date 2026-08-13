// api/speak.ts
// A Vercel serverless function that turns text into speech.
//
// The phone calls THIS function (instead of ElevenLabs directly), so the
// ElevenLabs API key stays on the server and never reaches the browser.

export default async function handler(req: any, res: any) {
  // The key is a server-side secret, set in Vercel's project settings.
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY not set on the server" });
  }

  const text = req.body?.text;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "missing text" });
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": key,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "ElevenLabs error" });
    }

    // Send the audio straight back to the phone.
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(audio);
  } catch (error) {
    return res.status(502).json({ error: "could not reach ElevenLabs" });
  }
}
