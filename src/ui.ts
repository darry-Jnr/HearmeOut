// ui.ts
// Tiny helpers for showing text/status on the page.
// Kept separate so the other files stay readable.

const statusEl = document.querySelector<HTMLElement>("#status")!;

export function showStatus(message: string, kind: "info" | "good" | "error" = "info") {
  statusEl.textContent = message;
  statusEl.className = "status " + kind;
}

export function setYouSaid(text: string) {
  document.querySelector<HTMLElement>("#youSaid")!.textContent = text;
}

export function setTheySaid(text: string) {
  document.querySelector<HTMLElement>("#theySaid")!.textContent = text || "—";
}
