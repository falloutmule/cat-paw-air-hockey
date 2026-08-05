export type ThemeSlot = "paw1" | "paw2" | "puck" | "emblem" | "mascot1" | "mascot2" | "goal1" | "goal2" | "impact" | "confetti" | "winner" | "corner" | "felt" | "rail";
export interface ThemePalette { readonly table: string; readonly felt: string; readonly rail: string; readonly markings: string; readonly player1: string; readonly player2: string; readonly yarn: string; readonly shadow: string; }
export interface ValidTheme { readonly filename: string; readonly blob: Blob; readonly url: string; readonly palette: ThemePalette; readonly slots: Readonly<Record<ThemeSlot, boolean>>; }
const slots: readonly ThemeSlot[] = ["paw1", "paw2", "puck", "emblem", "mascot1", "mascot2", "goal1", "goal2", "impact", "confetti", "winner", "corner", "felt", "rail"];
const defaults: ThemePalette = Object.freeze({ table: "#172331", felt: "#263f4c", rail: "#a97549", markings: "#fff4d6", player1: "#41d8c7", player2: "#ff8c78", yarn: "#ffd45c", shadow: "#071018" });
const dbName = "cat-paw-air-hockey-theme-v1";
function color(data: Uint8ClampedArray, index: number, fallback: string): string { return data[index + 3] === 0 ? fallback : `#${[data[index], data[index + 1], data[index + 2]].map((value) => value.toString(16).padStart(2, "0")).join("")}`; }
function database(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open(dbName, 1); request.onupgradeneeded = () => request.result.createObjectStore("themes"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
export async function validateTheme(file: File): Promise<ValidTheme> {
  if (file.type !== "image/png" || file.size > 8 * 1024 * 1024) throw new Error("Theme must be a PNG no larger than 8 MiB.");
  const bitmap = await createImageBitmap(file); if (bitmap.width !== 1024 || bitmap.height !== 1024) { bitmap.close(); throw new Error("Theme must be exactly 1024 × 1024 pixels."); }
  const canvas = new OffscreenCanvas(1024, 1024); const context = canvas.getContext("2d", { willReadFrequently: true }); if (context === null) { bitmap.close(); throw new Error("Theme pixel validation is unavailable."); }
  context.drawImage(bitmap, 0, 0); bitmap.close(); const data = context.getImageData(0, 0, 1024, 1024).data;
  const filled = (cell: number): boolean => { const x = (cell % 4) * 256 + 128; const y = Math.floor(cell / 4) * 256 + 128; return data[(y * 1024 + x) * 4 + 3] > 8; };
  const paletteIndexes = [[536, 792], [600, 792], [664, 792], [728, 792], [536, 856], [600, 856], [664, 856], [728, 856]] as const;
  const paletteValues = paletteIndexes.map(([x, y], index) => color(data, (y * 1024 + x) * 4, Object.values(defaults)[index]!));
  const palette = Object.freeze({ table: paletteValues[0]!, felt: paletteValues[1]!, rail: paletteValues[2]!, markings: paletteValues[3]!, player1: paletteValues[4]!, player2: paletteValues[5]!, yarn: paletteValues[6]!, shadow: paletteValues[7]! });
  return Object.freeze({ filename: file.name, blob: file, url: URL.createObjectURL(file), palette, slots: Object.freeze(Object.fromEntries(slots.map((slot, index) => [slot, filled(index)])) as Record<ThemeSlot, boolean>) });
}
export async function saveTheme(theme: ValidTheme): Promise<void> { const db = await database(); await new Promise<void>((resolve, reject) => { const request = db.transaction("themes", "readwrite").objectStore("themes").put({ filename: theme.filename, blob: theme.blob }, "latest"); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); }); db.close(); }
export async function loadTheme(): Promise<File | undefined> { const db = await database(); const value = await new Promise<{ filename: string; blob: Blob } | undefined>((resolve, reject) => { const request = db.transaction("themes").objectStore("themes").get("latest"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); db.close(); return value === undefined ? undefined : new File([value.blob], value.filename, { type: "image/png" }); }
export async function clearTheme(): Promise<void> { const db = await database(); await new Promise<void>((resolve, reject) => { const request = db.transaction("themes", "readwrite").objectStore("themes").delete("latest"); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); }); db.close(); }
export async function makeThemeAsset(guide: boolean): Promise<Blob> {
  const canvas = new OffscreenCanvas(1024, 1024); const context = canvas.getContext("2d"); if (context === null) throw new Error("Theme template generation is unavailable.");
  context.clearRect(0, 0, 1024, 1024); const colors = ["#41d8c7", "#ff8c78", "#ffd45c", "#fff4d6"];
  for (let cell = 0; cell < 16; cell += 1) { const x = cell % 4 * 256; const y = Math.floor(cell / 4) * 256; context.strokeStyle = guide ? "#fff4d6" : "transparent"; context.lineWidth = 2; context.strokeRect(x + 24, y + 24, 208, 208); if (cell < 4) { context.fillStyle = colors[cell]; context.beginPath(); context.arc(x + 128, y + 128, cell === 2 ? 58 : 76, 0, Math.PI * 2); context.fill(); } }
  if (guide) { context.fillStyle = "#fff4d6"; context.font = "bold 20px system-ui"; ["P1 PAW", "P2 PAW", "PUCK", "EMBLEM", "P1 CAT", "P2 CAT", "P1 GOAL", "P2 GOAL", "IMPACT", "CONFETTI", "WINNER", "CORNER", "FELT", "RAIL", "SWATCHES", "RESERVED"].forEach((label, cell) => context.fillText(label, cell % 4 * 256 + 34, Math.floor(cell / 4) * 256 + 52)); }
  const swatches = Object.values(defaults); swatches.forEach((value, index) => { const x = 512 + (index % 4) * 64 + 16; const y = 768 + Math.floor(index / 4) * 64 + 16; context.fillStyle = value; context.fillRect(x, y, 48, 48); });
  return canvas.convertToBlob({ type: "image/png" });
}
