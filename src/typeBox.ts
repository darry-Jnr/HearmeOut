// typeBox.ts
// The "Type a message" popup, as its own component.
// It owns its own HTML, its chat history (kept in sessionStorage so it lasts
// for the current tab and clears when you close it) and its buttons. When
// you send a message it calls the onSend callback, so the rest of the app
// never has to know how the box is built.

export interface TypeBoxOptions {
  onSend: (text: string) => void;
}

const HISTORY_KEY = "hearmeout:history";

export function createTypeBox(options: TypeBoxOptions): { element: HTMLElement; open: () => void } {
  const box = document.createElement("div");
  box.className =
    "absolute bottom-3 right-3 z-20 hidden w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-4 shadow-2xl";
  box.innerHTML = `
    <div class="mb-2 flex items-center justify-between">
      <div class="text-sm font-semibold text-white">Type a message</div>
      <button data-close class="cursor-pointer p-1 active:opacity-60" aria-label="Close">
        <img src="/cancel.png" alt="Close" class="h-4 w-4" />
      </button>
    </div>
    <div data-history class="mb-3 flex max-h-52 flex-col gap-1.5 overflow-y-auto"></div>
    <div class="relative">
      <input
        data-input
        type="text"
        placeholder="Type here and press Send…"
        class="w-full rounded-full border border-neutral-700 bg-black py-3 pr-12 pl-4 text-white outline-none placeholder:text-neutral-600 focus:border-white"
      />
      <button data-send class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full bg-white p-1.5 active:bg-neutral-200" aria-label="Send">
        <img src="/send.png" alt="Send" class="h-4 w-4" />
      </button>
    </div>
  `;

  const input = box.querySelector<HTMLInputElement>("[data-input]")!;
  const history = box.querySelector<HTMLElement>("[data-history]")!;
  const closeBtn = box.querySelector<HTMLButtonElement>("[data-close]")!;
  const sendBtn = box.querySelector<HTMLButtonElement>("[data-send]")!;

  function loadHistory(): string[] {
    try {
      const arr = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(arr) ? arr.filter((m) => typeof m === "string") : [];
    } catch {
      return [];
    }
  }

  function saveHistory(items: string[]) {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked — that's fine, we just don't remember.
    }
  }

  function renderHistory() {
    history.textContent = "";
    for (const text of loadHistory()) {
      const bubble = document.createElement("div");
      bubble.className =
        "max-w-[85%] self-end rounded-xl rounded-br-sm bg-white px-3 py-1.5 text-sm font-medium break-words text-black";
      bubble.textContent = text;
      history.append(bubble);
    }
    history.scrollTop = history.scrollHeight;
  }

  function open() {
    renderHistory();
    box.classList.remove("hidden");
    input.focus();
  }

  function close() {
    box.classList.add("hidden");
    input.value = "";
  }

  function send() {
    const text = input.value.trim();
    if (!text) return;
    options.onSend(text);
    saveHistory([...loadHistory(), text]);
    renderHistory();
    input.value = "";
    // The box stays open so you can keep sending more.
  }

  closeBtn.addEventListener("click", close);
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") send();
  });

  // Clicking the screen outside the box closes it — desktop only.
  // (On phones a stray tap would fight with the camera/pinch gestures.)
  const isDesktop = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.addEventListener("pointerdown", (event) => {
    if (!isDesktop()) return;
    if (box.classList.contains("hidden")) return;
    if (!box.contains(event.target as Node)) close();
  });

  return { element: box, open };
}
