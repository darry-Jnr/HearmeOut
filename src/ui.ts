// ui.ts
// Tiny helpers for showing text/status on the page.
// Kept separate so the other files stay readable.

const statusEl = document.querySelector<HTMLElement>("#status")!;

export function showStatus(message: string, kind: "info" | "good" | "error" = "info") {
  statusEl.textContent = message;
  statusEl.classList.remove("text-neutral-400", "text-white", "font-bold");
  statusEl.classList.add(
    ...(kind === "good"
      ? ["text-white"]
      : kind === "error"
        ? ["text-white", "font-bold"]
        : ["text-neutral-400"])
  );
}

export function setYouSaid(text: string) {
  document.querySelector<HTMLElement>("#youSaid")!.textContent = text;
}

export function setTheySaid(text: string) {
  document.querySelector<HTMLElement>("#theySaid")!.textContent = text || "—";
}
