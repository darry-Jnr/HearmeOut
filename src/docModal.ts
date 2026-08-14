// docModal.ts
// The documentation as an in-app modal. It looks like the old /doc page
// (nav links on the left, content on the right) but stays inside the app:
// the URL never changes and the camera keeps running behind it.

export interface DocModal {
  element: HTMLElement;
  open: () => void;
  close: () => void;
}

export function createDocModal(): DocModal {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 z-50 hidden items-center justify-center bg-black/80 p-4";

  modal.innerHTML = `
    <div data-panel class="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl will-change-transform">
      <!-- Dragging the header moves the modal around (laptop/mouse only). -->
      <header data-drag class="flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-4 border-b border-neutral-800 px-6 py-4">
        <div class="flex items-center gap-3">
          <span class="text-neutral-600" title="Drag to move">⠿</span>
          <div class="font-logo text-xl font-medium text-white">
            hearmeout <span class="text-neutral-600">|</span>
            <span class="text-neutral-400">how to use</span>
          </div>
        </div>
        <button data-close class="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-600 bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-neutral-900 active:bg-white active:text-black">Close</button>
      </header>

      <div class="flex min-h-0 flex-1">
        <!-- Left: sign list, looks like links -->
        <aside class="hidden w-56 shrink-0 overflow-y-auto py-6 pl-6 pr-4 md:block">
          <p class="text-[11px] uppercase tracking-widest text-neutral-500">The signs</p>
          <ul class="mt-3 space-y-2">
            <li><button data-jump="#hello" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">✋ Hello!</button></li>
            <li><button data-jump="#yes" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">👍 Yes</button></li>
            <li><button data-jump="#no" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">👎 No</button></li>
            <li><button data-jump="#iloveyou" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">🤟 I love you</button></li>
            <li><button data-jump="#victory" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">✌️ Victory!</button></li>
            <li><button data-jump="#excuse" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">☝️ Excuse me!</button></li>
            <li><button data-jump="#stop" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">✊ Stop!</button></li>
          </ul>

          <p class="mt-8 text-[11px] uppercase tracking-widest text-neutral-500">Using the app</p>
          <ul class="mt-3 space-y-2">
            <li><button data-jump="#controls" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">Controls</button></li>
            <li><button data-jump="#tips" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">Tips</button></li>
            <li><button data-jump="#browser" class="inline-block cursor-pointer bg-transparent p-0 font-inherit text-left text-[#4f8cff] underline underline-offset-4 hover:text-white">Browser support</button></li>
          </ul>
        </aside>

        <!-- Right: the content -->
        <div class="min-w-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <section class="space-y-8">
            <div id="hello">
              <h3 class="text-lg font-bold">✋ Hello!</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "Hello!"</p>
              <p class="mt-1 text-neutral-300">Hold your hand open, palm facing the camera, all five fingers spread.</p>
            </div>
            <div id="yes">
              <h3 class="text-lg font-bold">👍 Yes</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "Yes"</p>
              <p class="mt-1 text-neutral-300">Make a fist, then stick your thumb straight up.</p>
            </div>
            <div id="no">
              <h3 class="text-lg font-bold">👎 No</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "No"</p>
              <p class="mt-1 text-neutral-300">Make a fist, then point your thumb straight down.</p>
            </div>
            <div id="iloveyou">
              <h3 class="text-lg font-bold">🤟 I love you</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "I love you"</p>
              <p class="mt-1 text-neutral-300">
                Extend your thumb, index finger and pinky, and fold your middle and ring
                fingers onto your palm — it's the "I" + "L" + "Y" fingerspelling shape.
              </p>
            </div>
            <div id="victory">
              <h3 class="text-lg font-bold">✌️ Victory!</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "Victory!"</p>
              <p class="mt-1 text-neutral-300">Extend your index and middle fingers into a V and fold the other fingers down.</p>
            </div>
            <div id="excuse">
              <h3 class="text-lg font-bold">☝️ Excuse me!</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "Excuse me!"</p>
              <p class="mt-1 text-neutral-300">Point your index finger straight up and fold the other fingers into your palm.</p>
            </div>
            <div id="stop">
              <h3 class="text-lg font-bold">✊ Stop!</h3>
              <p class="mt-1 text-sm text-neutral-400">Says: "Stop!"</p>
              <p class="mt-1 text-neutral-300">Make a closed fist.</p>
            </div>
          </section>

          <hr class="my-10 border-neutral-800" />

          <section id="controls">
            <h2 class="text-2xl font-bold">Controls</h2>
            <ul class="mt-4 space-y-2 text-sm text-neutral-300">
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                  <img src="/start.png" alt="Start" class="h-3.5 w-3.5" />
                </span>
                <span><span class="text-white">Start</span> — turns the camera on.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500">
                  <img src="/stop.png" alt="Stop" class="h-3.5 w-3.5" />
                </span>
                <span><span class="text-white">Stop</span> — turns the camera off.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-600 bg-black/70">
                  <img src="/mute.png" alt="Muted" class="h-3.5 w-3.5" />
                </span>
                <span><span class="text-white">Mute</span> — silences the spoken voice; the text still shows.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-600 bg-black/70">
                  <img src="/unmute.png" alt="Unmuted" class="h-3.5 w-3.5" />
                </span>
                <span><span class="text-white">Unmute</span> — turns the spoken voice back on.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-600 bg-black/70">
                  <img src="/type.png" alt="Type" class="h-3.5 w-3.5" />
                </span>
                <span><span class="text-white">Type</span> — write a message instead of signing.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span><span class="text-white">Auto-speak my signs</span> — say each recognized sign out loud (on by default).</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span><span class="text-white">Captions on</span> — show the other person's words live under "They said".</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-white">•</span>
                <span><span class="text-white">Zoom (− / +)</span> — desktop only; phones pinch naturally.</span>
              </li>
            </ul>
          </section>

          <hr class="my-10 border-neutral-800" />

          <section id="tips">
            <h2 class="text-2xl font-bold">Tips for accurate signing</h2>
            <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-300">
              <li>Hold each sign still for about <span class="text-white">0.7 seconds</span> before moving on.</li>
              <li>Keep your <span class="text-white">palm facing the camera</span> and your whole hand in frame.</li>
              <li>Use <span class="text-white">even lighting</span>; avoid busy backgrounds behind your hand.</li>
              <li>If a sign is missed, tap the matching phrase button at the bottom of the app.</li>
            </ul>
          </section>

          <hr class="my-10 border-neutral-800" />

          <section id="browser">
            <h2 class="text-2xl font-bold">Browser support</h2>
            <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-300">
              <li>Everything works in <span class="text-white">Chrome, Edge, Firefox and Safari</span>.</li>
              <li>Live captions need <span class="text-white">Chrome or Edge</span> (Safari and Firefox don't have that API yet).</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  `;

  const panel = modal.querySelector<HTMLElement>("[data-panel]")!;
  const header = modal.querySelector<HTMLElement>("[data-drag]")!;

  // Where the modal has been dragged to, so it stays put until reopened.
  let offsetX = 0;
  let offsetY = 0;

  function open() {
    // Re-center the modal every time it opens.
    offsetX = 0;
    offsetY = 0;
    panel.style.transform = "";
    modal.classList.remove("hidden");
  }

  function close() {
    modal.classList.add("hidden");
  }

  // Drag-to-move on the header. Only wired up for fine pointers (mouse,
  // trackpad) — on touch screens it would fight with scrolling.
  if (window.matchMedia("(pointer: fine)").matches) {
    let dragging = false;
    let startX = 0;
    let startY = 0;

    header.addEventListener("pointerdown", (event) => {
      if (event.target instanceof HTMLElement && event.target.closest("[data-close]")) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      header.setPointerCapture(event.pointerId);
      header.classList.add("cursor-grabbing");
    });

    header.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      offsetX += event.clientX - startX;
      offsetY += event.clientY - startY;
      startX = event.clientX;
      startY = event.clientY;
      panel.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    });

    const stopDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      header.classList.remove("cursor-grabbing");
      try {
        header.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer was already released; nothing to do.
      }
    };
    header.addEventListener("pointerup", stopDrag);
    header.addEventListener("pointercancel", stopDrag);
  }

  // Nav links scroll the matching section into view (inside the modal).
  modal.querySelectorAll<HTMLButtonElement>("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = modal.querySelector<HTMLElement>(btn.dataset.jump!);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  modal.querySelector<HTMLButtonElement>("[data-close]")!.addEventListener("click", close);

  // Clicking the dark area outside the panel closes it too.
  modal.addEventListener("pointerdown", (event) => {
    if (event.target === modal) close();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  return { element: modal, open, close };
}
