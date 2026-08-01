import { createSfhsPixiV8Presentation, supportsRequiredWebGl } from "@sfhs/adapter-pixi-v8";
import { createSfhsPixiGameRuntime, type SfhsPixiGameRuntime } from "@sfhs/pixi-runtime";
import { createHockeyAudioController } from "./audio.ts";
import { MAXIMUM_FRAME_DELTA_MS, SIMULATION_HZ } from "./constants.ts";
import { installDiagnostics } from "./diagnostics.ts";
import { createHockeyInput } from "./input.ts";
import { createCatHockeyPresenter } from "./presentation.ts";
import { createCatHockeyScene } from "./scene.ts";
import type { HockeyGameState } from "./state.ts";

function required<ElementType extends Element>(selector: string): ElementType {
  const element = document.querySelector<ElementType>(selector);
  if (element === null) throw new Error(`Missing required Cat Air Hockey element: ${selector}`);
  return element;
}

const shell = required<HTMLElement>("#game-shell");
const host = required<HTMLElement>("#pixi-host");
const capability = required<HTMLElement>("#capability-page");
const orientationGate = required<HTMLElement>("#orientation-gate");
const status = required<HTMLOutputElement>("#runtime-status");
const muteButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='mute']")];
const pauseButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='pause']")];
const effectsButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='effects']")];

let runtime: SfhsPixiGameRuntime<HockeyGameState> | undefined;
let hiddenPaused = false;
let orientationPaused = false;
let reducedEffects = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const audio = createHockeyAudioController();
const scene = createCatHockeyScene();
const presenter = createCatHockeyPresenter({ onEvents: (events) => audio.consume(events) });
const presentation = createSfhsPixiV8Presentation<HockeyGameState>({
  backgroundColor: 0x172331,
  presenter
});
const input = createHockeyInput({
  initialSurface: host,
  getCanvas: () => runtime?.getPrimarySurface(),
  onIntentionalGesture: () => { void audio.unlock().then(updateControls); }
});

function isLandscape(): boolean {
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return width > height;
}

function updateControls(): void {
  const muted = audio.isMuted();
  for (const button of muteButtons) {
    button.textContent = muted ? "🔇" : "🔊";
    const soundLabel = muted ? "Sound off" : "Sound on";
    button.setAttribute("aria-label", soundLabel);
    button.title = soundLabel;
    button.setAttribute("aria-pressed", String(muted));
  }
  for (const button of effectsButtons) {
    button.textContent = reducedEffects ? "◌" : "✨";
    const effectsLabel = reducedEffects ? "Reduced effects" : "Full effects";
    button.setAttribute("aria-label", effectsLabel);
    button.title = effectsLabel;
    button.setAttribute("aria-pressed", String(reducedEffects));
  }
  const paused = runtime?.getState().phase === "paused";
  for (const button of pauseButtons) {
    button.textContent = paused ? "▶" : "Ⅱ";
    const pauseLabel = paused ? "Resume" : "Pause";
    button.setAttribute("aria-label", pauseLabel);
    button.title = pauseLabel;
  }
  status.value = `Audio ${audio.getStatus()} · ${reducedEffects ? "reduced" : "full"} effects`;
}

function applyOrientationGate(): void {
  const landscape = isLandscape();
  orientationGate.hidden = !landscape;
  shell.dataset.orientation = landscape ? "landscape" : "portrait";
  if (runtime === undefined) return;
  if (landscape && !orientationPaused) {
    orientationPaused = true;
    runtime.pause();
    input.clear();
  } else if (!landscape && orientationPaused) {
    orientationPaused = false;
    if (!document.hidden) runtime.resume();
  }
}

for (const button of muteButtons) {
  button.addEventListener("pointerdown", () => { void audio.unlock(); }, { passive: true });
  button.addEventListener("click", () => { audio.playUi("mute"); audio.toggleMuted(); updateControls(); });
}
for (const button of pauseButtons) {
  button.addEventListener("pointerdown", () => { void audio.unlock(); }, { passive: true });
  button.addEventListener("click", () => { input.requestPause(); audio.playUi("pause"); setTimeout(updateControls, 40); });
}
for (const button of effectsButtons) {
  button.addEventListener("click", () => {
    reducedEffects = !reducedEffects;
    scene.setReducedEffects(reducedEffects);
    presenter.setReducedEffects(reducedEffects);
    updateControls();
  });
}

const removeDiagnostics = installDiagnostics({
  getRuntime: () => runtime,
  input,
  getAudioStatus: () => audio.getStatus(),
  getOrientationGate: () => !orientationGate.hidden
});

async function boot(): Promise<void> {
  if (!supportsRequiredWebGl(document)) {
    capability.hidden = false;
    host.hidden = true;
    status.value = "WebGL unavailable";
    return;
  }
  try {
    runtime = await createSfhsPixiGameRuntime({
      host,
      presentation,
      scene,
      actions: input,
      viewport: {
        mode: "fixed",
        logicalWidth: 540,
        logicalHeight: 960,
        maximumDevicePixelRatio: 2,
        scalePolicy: "contain"
      },
      simulationHz: SIMULATION_HZ,
      maximumFrameDeltaMilliseconds: MAXIMUM_FRAME_DELTA_MS
    });
    input.setSurface(host, () => runtime?.getPrimarySurface());
    scene.setReducedEffects(reducedEffects);
    presenter.setReducedEffects(reducedEffects);
    runtime.start();
    status.value = "Ready — both players hold a paw";
    applyOrientationGate();
    updateControls();
  } catch (error) {
    capability.hidden = false;
    capability.querySelector("p")!.textContent = "The required PixiJS WebGL renderer could not initialize.";
    host.hidden = true;
    status.value = error instanceof Error ? error.message : "Renderer initialization failed";
  }
}

document.addEventListener("visibilitychange", () => {
  if (runtime === undefined) return;
  if (document.hidden) {
    hiddenPaused = true;
    runtime.pause();
    input.clear();
  } else if (hiddenPaused) {
    hiddenPaused = false;
    if (!orientationPaused) runtime.resume();
  }
});
window.addEventListener("resize", applyOrientationGate);
window.addEventListener("orientationchange", applyOrientationGate);
window.visualViewport?.addEventListener("resize", applyOrientationGate);
window.addEventListener("pagehide", () => {
  removeDiagnostics();
  runtime?.destroy();
  input.destroy();
  void audio.dispose();
}, { once: true });

updateControls();
void boot();
