import { createSfhsPixiV8Presentation, supportsRequiredWebGl } from "@sfhs/adapter-pixi-v8";
import { createSfhsPixiGameRuntime, type SfhsPixiGameRuntime } from "@sfhs/pixi-runtime";
import { createHockeyAudioController } from "./audio.ts";
import { makeBoardTemplateBlob } from "./board-art.ts";
import { MAXIMUM_FRAME_DELTA_MS, SIMULATION_HZ } from "./constants.ts";
import { lowerLeftControl } from "./controls.ts";
import { fullscreenAvailable, fullscreenElement, toggleElementFullscreen } from "./fullscreen.ts";
import { installDiagnostics } from "./diagnostics.ts";
import { createHockeyInput } from "./input.ts";
import { createCatHockeyPresenter } from "./presentation.ts";
import { createCatHockeyScene } from "./scene.ts";
import { DEFAULT_MATCH_SETTINGS, normalizeMatchSettings, settingsEqual, settingsSummary, type MatchSettings } from "./settings.ts";
import { clearBoard, clearTheme, loadBoard, loadTheme, saveBoard, saveTheme, validateBoard, validateTheme, type ValidBoard, type ValidTheme } from "./theme.ts";
import type { HockeyGameState } from "./state.ts";
import defaultBoardTemplateUrl from "../art/theme/cat-paw-board-template.png";

function required<ElementType extends Element>(selector: string): ElementType {
  const element = document.querySelector<ElementType>(selector);
  if (element === null) throw new Error(`Missing required Cat Air Hockey element: ${selector}`);
  return element;
}

const shell = required<HTMLElement>("#game-shell");
const boardTemplateMode = new URLSearchParams(window.location.search).has("board-template");
const boardTemplateSourceMode = new URLSearchParams(window.location.search).has("board-template-source");
shell.dataset.boardTemplateMode = String(boardTemplateMode);
const host = required<HTMLElement>("#pixi-host");
const capability = required<HTMLElement>("#capability-page");
const orientationGate = required<HTMLElement>("#orientation-gate");
const status = required<HTMLOutputElement>("#runtime-status");
const settingsOverlay = required<HTMLElement>("#settings-overlay");
const settingsLive = required<HTMLOutputElement>("#settings-live");
const themeFile = required<HTMLInputElement>("#theme-file");
const boardFile = required<HTMLInputElement>("#board-file");
const muteButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='mute']")];
const pauseButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='pause']")];
const menuButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='menu']")];
const fullscreenButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='fullscreen']")];
const captureButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action='capture']")];
const controlFeedback = required<HTMLOutputElement>("#control-feedback");
const menuViews = [...document.querySelectorAll<HTMLElement>("[data-menu-view]")];

let runtime: SfhsPixiGameRuntime<HockeyGameState> | undefined;
let hiddenPaused = false;
let orientationPaused = false;
let menuOpen = false;
let captureInProgress = false;
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
let suppressFullscreenClickUntil = 0;
let viewportFrame = 0;
let reducedEffects = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
let currentTheme: ValidTheme | undefined;
let currentBoard: ValidBoard | undefined;
const settingsStorageKey = "cat-paw-air-hockey.settings.v1";
function loadSettings(): MatchSettings { try { return normalizeMatchSettings(JSON.parse(localStorage.getItem(settingsStorageKey) ?? "null")); } catch { return DEFAULT_MATCH_SETTINGS; } }
let menuSettings = loadSettings();
try { const stored = localStorage.getItem("cat-paw-air-hockey.reduced-motion.v1"); if (stored !== null) reducedEffects = stored === "true"; } catch { /* session fallback */ }

const audio = createHockeyAudioController();
const scene = createCatHockeyScene();
const presenter = createCatHockeyPresenter({ onEvents: (events) => audio.consume(events), boardTemplateMode });
const presentation = createSfhsPixiV8Presentation<HockeyGameState>({ backgroundColor: 0x172331, presenter });
const input = createHockeyInput({ initialSurface: host, getCanvas: () => runtime?.getPrimarySurface(), onIntentionalGesture: () => { void audio.unlock().then(updateControls); } });

const menuMarkup = `<h2>Cat Paw settings</h2><p class="settings-summary" data-summary></p><fieldset><legend>Gameplay</legend>
${[["puckSpeed", "Puck speed", 70, 130], ["pawSpeed1", "Player 1 paw speed", 70, 130], ["pawSpeed2", "Player 2 paw speed", 70, 130], ["returnSpeed1", "Player 1 return speed", 70, 130], ["returnSpeed2", "Player 2 return speed", 70, 130], ["puckSize", "Puck size", 75, 125], ["pawSize1", "Player 1 paw size", 75, 125], ["pawSize2", "Player 2 paw size", 75, 125], ["goalSize1", "Player 1 goal opening", 75, 125], ["goalSize2", "Player 2 goal opening", 75, 125]].map(([key, label, min, max]) => `<label>${label}<output data-value="${key}"></output><input data-setting="${key}" type="range" min="${min}" max="${max}" step="5"></label>`).join("")}
  <button type="button" data-menu-action="reset">Reset Gameplay Defaults</button></fieldset><fieldset><legend>Display</legend><label>Reduced motion <input data-menu-action="reduced" type="checkbox"></label><p data-fullscreen-status></p></fieldset><fieldset><legend>Theme</legend><div class="board-preview"><img data-board-preview alt="Current Board preview"><p data-board-status>Default Board</p></div><button type="button" data-menu-action="board-template">Download Board Template</button><button type="button" data-menu-action="load-board">Replace Board PNG</button><button type="button" data-menu-action="reset-board">Reset Board</button><details class="legacy-theme"><summary>Legacy composite theme</summary><button type="button" data-menu-action="load-theme">Load Legacy Theme PNG</button><button type="button" data-menu-action="reset-theme">Reset Legacy Theme</button><p data-theme-status>Classic legacy theme</p></details></fieldset><fieldset><legend>About / Reset</legend><p>Changes during a match apply next serve.</p><button type="button" data-menu-action="close">Close settings</button></fieldset>`;
for (const view of menuViews) view.innerHTML = menuMarkup;

function settingValue(key: string): number {
  const values: Record<string, number> = { puckSpeed: menuSettings.puckSpeed, pawSpeed1: menuSettings.pawSpeed[1], pawSpeed2: menuSettings.pawSpeed[2], returnSpeed1: menuSettings.returnSpeed[1], returnSpeed2: menuSettings.returnSpeed[2], puckSize: menuSettings.puckSize, pawSize1: menuSettings.pawSize[1], pawSize2: menuSettings.pawSize[2], goalSize1: menuSettings.goalSize[1], goalSize2: menuSettings.goalSize[2] };
  return values[key] ?? 100;
}
function syncMenuViews(): void {
  const state = runtime?.getState();
  for (const view of menuViews) {
    for (const range of view.querySelectorAll<HTMLInputElement>("input[data-setting]")) { range.value = String(settingValue(range.dataset.setting ?? "")); range.setAttribute("aria-valuetext", `${range.value}%`); range.dataset.default = String(range.value === "100"); }
    for (const output of view.querySelectorAll<HTMLOutputElement>("output[data-value]")) output.value = `${settingValue(output.dataset.value ?? "")}%`;
    const checkbox = view.querySelector<HTMLInputElement>("input[data-menu-action='reduced']"); if (checkbox !== null) checkbox.checked = reducedEffects;
    const summary = view.querySelector<HTMLElement>("[data-summary]"); if (summary !== null) summary.textContent = settingsEqual(state?.activeMatchSettings ?? menuSettings, menuSettings) ? settingsSummary(menuSettings) : `${settingsSummary(menuSettings)} · Applies next serve`;
    const fullscreenStatus = view.querySelector<HTMLElement>("[data-fullscreen-status]"); if (fullscreenStatus !== null) fullscreenStatus.textContent = fullscreenAvailable(document.documentElement) ? (fullscreenElement() === null ? "Fullscreen available" : "Fullscreen active") : "Fullscreen unavailable in this browser view";
  }
}
function persistPreferences(): void { try { localStorage.setItem(settingsStorageKey, JSON.stringify(menuSettings)); localStorage.setItem("cat-paw-air-hockey.reduced-motion.v1", String(reducedEffects)); } catch { /* session fallback */ } }
function updateSetting(key: string, value: number): void {
  const next = { puckSpeed: menuSettings.puckSpeed, puckSize: menuSettings.puckSize, pawSpeed: { ...menuSettings.pawSpeed }, returnSpeed: { ...menuSettings.returnSpeed }, pawSize: { ...menuSettings.pawSize }, goalSize: { ...menuSettings.goalSize } };
  if (key === "puckSpeed" || key === "puckSize") next[key] = value;
  else if (key === "pawSpeed1") next.pawSpeed[1] = value; else if (key === "pawSpeed2") next.pawSpeed[2] = value;
  else if (key === "returnSpeed1") next.returnSpeed[1] = value; else if (key === "returnSpeed2") next.returnSpeed[2] = value;
  else if (key === "pawSize1") next.pawSize[1] = value; else if (key === "pawSize2") next.pawSize[2] = value;
  else if (key === "goalSize1") next.goalSize[1] = value; else if (key === "goalSize2") next.goalSize[2] = value;
  menuSettings = normalizeMatchSettings(next); input.requestSettings(menuSettings); persistPreferences(); syncMenuViews();
}

function isLandscape(): boolean { const width = window.visualViewport?.width ?? window.innerWidth; const height = window.visualViewport?.height ?? window.innerHeight; return width > height; }
function applyOrientationGate(): void {
  const landscape = isLandscape(); orientationGate.hidden = !landscape; shell.dataset.orientation = landscape ? "landscape" : "portrait";
  if (runtime === undefined) return;
  if (landscape && !orientationPaused) { orientationPaused = true; runtime.pause(); input.clear(); }
  else if (!landscape && orientationPaused) { orientationPaused = false; if (!document.hidden) runtime.resume(); }
}
function scheduleViewport(): void { if (viewportFrame !== 0) return; viewportFrame = requestAnimationFrame(() => { viewportFrame = 0; applyOrientationGate(); updateControls(); }); }
function setMenuOpen(open: boolean): void {
  if (open) { input.clear(); if (runtime?.getState().phase !== "paused") input.requestPause(); menuOpen = true; settingsOverlay.hidden = false; settingsLive.value = "Settings open. Match paused."; }
  else { input.clear(); menuOpen = false; settingsOverlay.hidden = true; settingsLive.value = "Settings closed. Press Resume to continue."; }
  updateControls();
}
function themeStatus(message: string): void { for (const view of menuViews) { const statusElement = view.querySelector<HTMLElement>("[data-theme-status]"); if (statusElement !== null) statusElement.textContent = message; } settingsLive.value = message; }
function showControlFeedback(message: string): void { controlFeedback.value = message; controlFeedback.hidden = false; if (feedbackTimer !== undefined) clearTimeout(feedbackTimer); feedbackTimer = setTimeout(() => { controlFeedback.hidden = true; }, 4_000); }
function syncBoardViews(): void { for (const view of menuViews) { const preview = view.querySelector<HTMLImageElement>("[data-board-preview]"); if (preview !== null) preview.src = currentBoard?.url ?? defaultBoardTemplateUrl; const boardStatusElement = view.querySelector<HTMLElement>("[data-board-status]"); if (boardStatusElement !== null) boardStatusElement.textContent = currentBoard === undefined ? "Default Board · 1080 × 1920 PNG" : `${currentBoard.filename} · 1080 × 1920 PNG`; } shell.dataset.board = currentBoard === undefined ? "default" : "custom"; }
function boardStatus(message: string): void { syncBoardViews(); for (const view of menuViews) { const statusElement = view.querySelector<HTMLElement>("[data-board-status]"); if (statusElement !== null) statusElement.textContent = message; } settingsLive.value = message; }
async function downloadBoardTemplate(): Promise<void> {
  try { const link = document.createElement("a"); let temporaryUrl: string | undefined; if (boardTemplateSourceMode) { temporaryUrl = URL.createObjectURL(await makeBoardTemplateBlob()); link.href = temporaryUrl; } else link.href = defaultBoardTemplateUrl; link.download = "cat-paw-board-template.png"; link.click(); if (temporaryUrl !== undefined) setTimeout(() => URL.revokeObjectURL(temporaryUrl!), 1_000); boardStatus("Board template downloaded · 1080 × 1920 PNG"); }
  catch (error) { boardStatus(error instanceof Error ? error.message : "Board template download failed"); }
}
async function acceptBoard(file: File): Promise<void> {
  try { const next = await validateBoard(file); const previous = currentBoard; currentBoard = next; presenter.setBoard(next); try { await saveBoard(next); boardStatus(`Board loaded: ${next.filename}`); } catch { boardStatus(`Board loaded for this session: ${next.filename}`); } if (previous !== undefined) URL.revokeObjectURL(previous.url); }
  catch (error) { boardStatus(error instanceof Error ? error.message : "Board was not accepted"); }
}
async function resetBoard(): Promise<void> { const previous = currentBoard; currentBoard = undefined; presenter.setBoard(undefined); if (previous !== undefined) URL.revokeObjectURL(previous.url); try { await clearBoard(); boardStatus("Default Board restored"); } catch { boardStatus("Default Board restored for this session"); } }
async function acceptTheme(file: File): Promise<void> {
  try { const next = await validateTheme(file); const previous = currentTheme; currentTheme = next; presenter.setTheme(next); try { await saveTheme(next); themeStatus(`Theme loaded: ${next.filename}`); } catch { themeStatus(`Theme loaded for this session: ${next.filename}`); } if (previous !== undefined) URL.revokeObjectURL(previous.url); }
  catch (error) { themeStatus(error instanceof Error ? error.message : "Theme was not accepted"); }
}
function updateControls(): void {
  const muted = audio.isMuted(); const state = runtime?.getState(); const paused = state?.phase === "paused";
  for (const button of muteButtons) { button.textContent = muted ? "🔇" : "🔊"; button.setAttribute("aria-label", muted ? "Sound off" : "Sound on"); button.title = muted ? "Sound off" : "Sound on"; button.setAttribute("aria-pressed", String(muted)); }
  for (const button of pauseButtons) { button.textContent = paused ? "▶" : "Ⅱ"; button.setAttribute("aria-label", paused ? "Resume" : "Pause"); button.title = paused ? "Resume" : "Pause"; }
  const lowerLeft = lowerLeftControl(state?.phase);
  for (const button of pauseButtons) button.hidden = lowerLeft !== "pause";
  for (const button of menuButtons) { button.setAttribute("aria-label", menuOpen ? "Close settings" : "Open settings"); button.title = menuOpen ? "Close settings" : "Open settings"; button.setAttribute("aria-pressed", String(menuOpen)); }
  const canFullscreen = fullscreenAvailable(document.documentElement); const fullscreenActive = fullscreenElement() !== null;
  for (const button of fullscreenButtons) { button.disabled = !canFullscreen; button.hidden = false; button.setAttribute("aria-label", fullscreenActive ? "Exit fullscreen" : "Enter fullscreen"); button.title = canFullscreen ? button.getAttribute("aria-label") ?? "Fullscreen" : "Fullscreen unavailable in this browser view"; button.setAttribute("aria-pressed", String(fullscreenActive)); }
  for (const button of captureButtons) { button.hidden = lowerLeft !== "capture"; button.disabled = captureInProgress; }
  status.value = `Audio ${audio.getStatus()} · ${reducedEffects ? "reduced motion" : "full effects"}${menuOpen ? " · settings open" : ""}`; syncMenuViews();
}
async function toggleFullscreen(): Promise<void> {
  if (!fullscreenAvailable(document.documentElement)) { const message = "This preview blocks fullscreen. Download the HTML and open it directly in Chrome."; settingsLive.value = message; showControlFeedback(message); return; }
  input.clear();
  try { await toggleElementFullscreen(document.documentElement); }
  catch { const message = "Fullscreen was blocked by this viewer. Open the downloaded HTML directly in Chrome."; settingsLive.value = message; showControlFeedback(message); }
  scheduleViewport();
}
async function captureScore(): Promise<void> {
  const state = runtime?.getState(); const canvas = runtime?.getPrimarySurface(); if (state?.phase !== "won" || canvas === undefined || captureInProgress) return;
  captureInProgress = true; updateControls();
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png")); if (blob === null) throw new Error("PNG capture failed");
    const file = new File([blob], `cat-paw-${state.scores[1]}-${state.scores[2]}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] }) && navigator.share !== undefined) { try { await navigator.share({ files: [file], title: "Cat Paw Air Hockey" }); settingsLive.value = "Final score image shared"; } catch { settingsLive.value = "Score image share cancelled"; } }
    else { const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1_000); settingsLive.value = "Final score PNG saved"; }
  } finally { captureInProgress = false; updateControls(); }
}

for (const button of muteButtons) { button.addEventListener("pointerdown", () => { void audio.unlock(); }, { passive: true }); button.addEventListener("click", () => { audio.playUi("mute"); audio.toggleMuted(); updateControls(); }); }
for (const button of pauseButtons) { button.addEventListener("pointerdown", () => { void audio.unlock(); }, { passive: true }); button.addEventListener("click", () => { input.requestPause(); audio.playUi("pause"); setTimeout(updateControls, 40); }); }
for (const button of menuButtons) button.addEventListener("click", () => setMenuOpen(!menuOpen));
for (const button of fullscreenButtons) {
  button.addEventListener("pointerdown", (event) => { if (event.pointerType === "mouse" && event.button !== 0) return; event.preventDefault(); event.stopPropagation(); suppressFullscreenClickUntil = performance.now() + 1_000; void toggleFullscreen(); });
  button.addEventListener("click", (event) => { if (performance.now() < suppressFullscreenClickUntil) { event.preventDefault(); return; } void toggleFullscreen(); });
}
for (const button of captureButtons) button.addEventListener("click", () => { void captureScore(); });
for (const view of menuViews) {
  view.addEventListener("input", (event) => { const target = event.target as HTMLInputElement; if (target.dataset.setting !== undefined) updateSetting(target.dataset.setting, Number(target.value)); if (target.dataset.menuAction === "reduced") { reducedEffects = target.checked; scene.setReducedEffects(reducedEffects); presenter.setReducedEffects(reducedEffects); persistPreferences(); updateControls(); } });
  view.addEventListener("click", (event) => { const action = (event.target as HTMLElement).closest<HTMLElement>("[data-menu-action]")?.dataset.menuAction; if (action === "close") setMenuOpen(false); if (action === "reset") { menuSettings = DEFAULT_MATCH_SETTINGS; input.requestSettings(menuSettings); persistPreferences(); updateControls(); } if (action === "board-template") void downloadBoardTemplate(); if (action === "load-board") boardFile.click(); if (action === "reset-board") void resetBoard(); if (action === "load-theme") themeFile.click(); if (action === "reset-theme") { presenter.setTheme(undefined); currentTheme = undefined; void clearTheme().catch(() => undefined); themeStatus("Classic legacy theme restored"); } });
}
themeFile.addEventListener("change", () => { const file = themeFile.files?.[0]; if (file !== undefined) void acceptTheme(file); themeFile.value = ""; });
boardFile.addEventListener("change", () => { const file = boardFile.files?.[0]; if (file !== undefined) void acceptBoard(file); boardFile.value = ""; });
document.addEventListener("keydown", (event) => {
  if (!menuOpen || event.key !== "Tab") return;
  const focusable = [...settingsOverlay.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])")];
  if (focusable.length === 0) return;
  const index = focusable.indexOf(document.activeElement as HTMLElement);
  const next = event.shiftKey ? (index <= 0 ? focusable.length - 1 : index - 1) : (index === focusable.length - 1 ? 0 : index + 1);
  event.preventDefault(); focusable[next]!.focus();
});

const removeDiagnostics = installDiagnostics({ getRuntime: () => runtime, input, getAudioStatus: () => audio.getStatus(), getOrientationGate: () => !orientationGate.hidden, getBoardDiagnostics: () => presenter.getBoardDiagnostics() });
async function boot(): Promise<void> {
  if (!supportsRequiredWebGl(document)) { capability.hidden = false; host.hidden = true; status.value = "WebGL unavailable"; return; }
  try {
    runtime = await createSfhsPixiGameRuntime({ host, presentation, scene, actions: input, viewport: { mode: "fixed", logicalWidth: 540, logicalHeight: 960, maximumDevicePixelRatio: 2, scalePolicy: "contain" }, simulationHz: SIMULATION_HZ, maximumFrameDeltaMilliseconds: MAXIMUM_FRAME_DELTA_MS });
    input.setSurface(host, () => runtime?.getPrimarySurface()); scene.setReducedEffects(reducedEffects); presenter.setReducedEffects(reducedEffects); input.requestSettings(menuSettings); runtime.start(); status.value = "Ready — both players hold a paw"; applyOrientationGate(); updateControls();
    void loadTheme().then((file) => { if (file !== undefined) void acceptTheme(file); }).catch(() => themeStatus("Classic legacy theme (storage unavailable)"));
    void loadBoard().then((file) => { if (file !== undefined) void acceptBoard(file); else syncBoardViews(); }).catch(() => boardStatus("Default Board · storage unavailable"));
  } catch (error) { capability.hidden = false; capability.querySelector("p")!.textContent = "The required PixiJS WebGL renderer could not initialize."; host.hidden = true; status.value = error instanceof Error ? error.message : "Renderer initialization failed"; }
}
document.addEventListener("visibilitychange", () => { if (runtime === undefined) return; if (document.hidden) { hiddenPaused = true; runtime.pause(); input.clear(); } else if (hiddenPaused) { hiddenPaused = false; if (!orientationPaused) runtime.resume(); void audio.unlock().then(updateControls); } });
const onFullscreenChange = (): void => { input.clear(); if (fullscreenElement() === null && runtime?.getState().phase === "playing") input.requestPause(); updateControls(); scheduleViewport(); };
const onFullscreenError = (): void => { settingsLive.value = "Fullscreen was not allowed. Open the downloaded HTML directly in Chrome and try again."; updateControls(); };
document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
document.addEventListener("fullscreenerror", onFullscreenError);
document.addEventListener("webkitfullscreenerror", onFullscreenError);
window.addEventListener("resize", scheduleViewport); window.addEventListener("orientationchange", scheduleViewport); window.visualViewport?.addEventListener("resize", scheduleViewport); window.visualViewport?.addEventListener("scroll", scheduleViewport);
window.addEventListener("pagehide", () => { removeDiagnostics(); runtime?.destroy(); input.destroy(); if (currentBoard !== undefined) URL.revokeObjectURL(currentBoard.url); void audio.dispose(); }, { once: true });
syncBoardViews(); updateControls(); void boot();
