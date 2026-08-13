// ui.ts
// Tiny helpers for showing text/status on the page.
// Kept separate so the other files stay readable.

const statusEl = document.querySelector<HTMLElement>("#status")!;

export function showStatus(message: string, kind: "info" | "good" | "error" = "info") {
  statusEl.textContent = message;
  statusEl.classList.remove("text-[#8b91ad]", "text-[#2fd572]", "text-[#ff7b7b]");
  statusEl.classList.add(
    kind === "good" ? "text-[#2fd572]" : kind === "error" ? "text-[#ff7b7b]" : "text-[#8b91ad]"
  );
}

export function setYouSaid(text: string) {
  document.querySelector<HTMLElement>("#youSaid")!.textContent = text;
}

export function setTheySaid(text: string) {
  document.querySelector<HTMLElement>("#theySaid")!.textContent = text || "—";
}
