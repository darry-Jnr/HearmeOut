import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Serves POST /api/speak during local dev, using the same serverless handler
// that Vercel runs in production. This lets `npm run dev` work on its own
// (no Vercel CLI needed) and lets the phone on the LAN test the full
// voice pipeline over HTTP.
function apiSpeakDev(): Plugin {
  return {
    name: "api-speak-dev",
    configureServer(server) {
      server.middlewares.use("/api/speak", async (req: any, res: any, next: any) => {
        if (req.method !== "POST") return next();
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const body = chunks.length
            ? JSON.parse(Buffer.concat(chunks).toString("utf8"))
            : {};

          const { default: handler } = await server.ssrLoadModule("/api/speak.ts");
          const vercelRes = {
            status(code: number) {
              res.statusCode = code;
              return this;
            },
            setHeader(k: string, v: string) {
              res.setHeader(k, v);
            },
            json(obj: unknown) {
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify(obj));
            },
            send(data: any) {
              res.end(data);
            },
          };

          await handler({ body }, vercelRes);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

// Serves the app page at the clean URL /app (same as the vercel.json
// rewrite). Vite only serves .html files by their real name, so we point
// /app at /app.html before Vite's static middleware runs.
function appDev(): Plugin {
  return {
    name: "app-dev",
    configureServer(server) {
      server.middlewares.use("/app", (req: any, _res: any, next: any) => {
        if (req.url === "/app") req.url = "/app.html";
        next();
      });
    },
  };
}

// Vite builds a plain static web app: the landing page (index.html) and the
// camera app (app.html). Tailwind generates the CSS classes, and
// apiSpeakDev() wires up /api/speak for local testing.
export default defineConfig({
  plugins: [tailwindcss(), apiSpeakDev(), appDev()],
  // Build both the landing page (index.html) and the app (app.html).
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        app: "app.html",
      },
    },
  },
  server: {
    host: true,
  },
});
