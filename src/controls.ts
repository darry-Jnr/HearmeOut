// controls.ts
// The bottom control row, as its own component. It owns its own HTML so the
// app page stays clean and the controls can't be knocked out of place.
//
// The about button (which opens the documentation modal) is positioned
// absolutely at the far right and only shows on desktop, so it never shifts
// the centered controls.

export function createControls(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "relative";

  wrapper.innerHTML = `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button id="muteBtn" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-600 bg-black/70 backdrop-blur-sm active:bg-white" aria-label="Mute" title="Mute / unmute">
        <img id="muteIcon" src="/unmute.png" alt="Unmute" class="h-5 w-5" />
      </button>
      <button id="startBtn" class="flex cursor-pointer items-center gap-2 rounded-full bg-white px-7 py-2.5 text-base font-bold text-black disabled:cursor-wait disabled:opacity-50">
        <img id="startIcon" src="/start.png" alt="Start" class="h-5 w-5" />
        Start
      </button>
      <button id="typeBtn" class="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-600 bg-black/70 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm active:bg-white active:text-black">
        <img src="/type.png" alt="Type" class="h-4 w-4" />
        Type
      </button>
      <label class="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" id="autoSpeak" checked class="accent-white" />
        Auto-speak my signs
      </label>
      <label class="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" id="listenToggle" checked class="accent-white" />
        Captions on
      </label>
    </div>
    <button id="docBtn" aria-label="About / documentation" title="Documentation" class="pointer-coarse:hidden hidden sm:flex absolute top-1/2 right-0 h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl border border-neutral-600 bg-black/70 backdrop-blur-sm active:bg-white">
      <img src="/about.png" alt="Documentation" class="h-5 w-5" />
    </button>
  `;

  return wrapper;
}
