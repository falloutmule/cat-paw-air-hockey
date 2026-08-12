import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { inflateSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const projectRoot = resolve(import.meta.dirname);
const descriptorPath = resolve(projectRoot, "manifests/score-cat-export.json");
const metadataPath = resolve(repositoryRoot, "art/score-cats/cat-paw-score-cat-export.json");
const validationPath = resolve(repositoryRoot, "art/score-cats/cat-paw-score-cat-validation.json");
const evidenceRoot = resolve(repositoryRoot, "test-results/SCORE-CAT-GODOT-001");
const renderReportPath = resolve(evidenceRoot, "godot-render.json");
const previewPath = resolve(evidenceRoot, "phone/score-cat-preview.html");

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)]));
  return value;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!bytes.subarray(0, 8).equals(signature)) throw new Error("PNG signature is invalid.");
  let offset = 8; let width = 0; let height = 0; let bitDepth = 0; let colorType = 0; let interlace = 0;
  const idat = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset); const type = bytes.toString("ascii", offset + 4, offset + 8); const data = bytes.subarray(offset + 8, offset + 8 + length); offset += 12 + length;
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    if (type === "IDAT") idat.push(data);
    if (type === "IEND") break;
  }
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) throw new Error(`PNG must be non-interlaced 8-bit RGBA; received depth=${bitDepth} type=${colorType} interlace=${interlace}.`);
  const raw = inflateSync(Buffer.concat(idat)); const stride = width * 4; const pixels = Buffer.alloc(width * height * 4); let source = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[source++]; const row = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const encoded = raw[source++]; const left = x >= 4 ? pixels[row + x - 4] : 0; const up = y > 0 ? pixels[row - stride + x] : 0; const upperLeft = y > 0 && x >= 4 ? pixels[row - stride + x - 4] : 0;
      const predictor = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : filter === 4 ? paeth(left, up, upperLeft) : -1;
      if (predictor < 0) throw new Error(`Unsupported PNG filter ${filter}.`);
      pixels[row + x] = (encoded + predictor) & 255;
    }
  }
  return { width, height, pixels };
}

function frameAnalysis(decoded, index, descriptor) {
  const cellWidth = descriptor.workingFrame.width * descriptor.scale; const cellHeight = descriptor.workingFrame.height * descriptor.scale;
  const originX = (index % descriptor.sheet.columns) * cellWidth; const originY = Math.floor(index / descriptor.sheet.columns) * cellHeight;
  let minX = cellWidth; let minY = cellHeight; let maxX = -1; let maxY = -1; let alphaPixels = 0; const rgba = Buffer.alloc(cellWidth * cellHeight * 4); const alpha = Buffer.alloc(cellWidth * cellHeight);
  for (let y = 0; y < cellHeight; y += 1) for (let x = 0; x < cellWidth; x += 1) {
    const source = ((originY + y) * decoded.width + originX + x) * 4; const target = (y * cellWidth + x) * 4; decoded.pixels.copy(rgba, target, source, source + 4); const a = decoded.pixels[source + 3]; alpha[y * cellWidth + x] = a;
    if (a > 0) { alphaPixels += 1; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  }
  if (alphaPixels === 0) throw new Error(`Frame ${index} is empty.`);
  return { index, id: descriptor.frames[index].id, grounded: descriptor.frames[index].grounded, bounds: { minX, minY, maxX, maxY }, alphaPixels, rgbaSha256: sha256(rgba), alphaSha256: sha256(alpha), alpha };
}

function validateSheet(bytes, descriptor, label) {
  const decoded = decodePng(bytes); const cellWidth = descriptor.workingFrame.width * descriptor.scale; const cellHeight = descriptor.workingFrame.height * descriptor.scale;
  if (decoded.width !== cellWidth * descriptor.sheet.columns || decoded.height !== cellHeight * descriptor.sheet.rows) throw new Error(`${label} dimensions are ${decoded.width}x${decoded.height}, expected 640x640.`);
  const frames = descriptor.frames.map((_, index) => frameAnalysis(decoded, index, descriptor));
  for (const frame of frames) {
    const b = frame.bounds;
    if (b.minX < 2 || b.minY < 2 || b.maxX > cellWidth - 3 || b.maxY > cellHeight - 3) throw new Error(`${label} frame ${frame.index} touches the cell boundary: ${JSON.stringify(b)}.`);
    if (frame.alphaPixels < 450 || frame.alphaPixels > cellWidth * cellHeight * 0.65) throw new Error(`${label} frame ${frame.index} has unreasonable visible area ${frame.alphaPixels}.`);
    if (frame.grounded && (b.maxY < descriptor.anchor.y * descriptor.scale - 2 || b.maxY > descriptor.anchor.y * descriptor.scale + 2)) throw new Error(`${label} grounded frame ${frame.index} baseline is ${b.maxY}, expected ${descriptor.anchor.y * descriptor.scale}±2.`);
  }
  for (const [start, end] of [[0, 1], [2, 5], [6, 8], [9, 14]]) for (let index = start + 1; index <= end; index += 1) if (frames[index - 1].rgbaSha256 === frames[index].rgbaSha256) throw new Error(`${label} adjacent animation frames ${index - 1}/${index} are identical.`);
  return { decoded, frames: frames.map(({ alpha: _alpha, ...frame }) => frame), alphaFrames: frames.map((frame) => frame.alpha) };
}

function previewHtml(p1, p2, descriptor) {
  const images = { player1: `data:image/png;base64,${p1.toString("base64")}`, player2: `data:image/png;base64,${p2.toString("base64")}` };
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"><title>Cat Paw Score Cat Preview</title><style>
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#101821;color:#fff4d6}*{box-sizing:border-box}body{margin:0;min-height:100dvh;padding:max(14px,env(safe-area-inset-top)) 12px max(18px,env(safe-area-inset-bottom));background:linear-gradient(#253e4b 0 48%,#172331 48% 52%,#2c4652 52%)}h1{font-size:1.25rem;margin:0 0 10px;text-align:center}.board{display:grid;grid-template-rows:1fr 1fr;min-height:420px;border:4px solid #5d3d29;border-radius:20px;overflow:hidden;background:#263f4c}.end{display:flex;align-items:center;justify-content:center;gap:18px;position:relative}.end:first-child{transform:rotate(180deg)}.cat{width:120px;height:120px;image-rendering:pixelated;background-size:480px 480px;background-repeat:no-repeat}.score{font-size:54px;font-weight:900;text-shadow:0 3px #071018}.panel{position:sticky;bottom:0;margin-top:12px;padding:10px;border:1px solid #ffffff22;border-radius:16px;background:#101821ee}.buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}button{min-height:46px;border:0;border-radius:12px;font:700 .9rem system-ui;background:#fff4d6;color:#30233a}button[aria-pressed=true]{background:#ffd45c}.status{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:9px 0 0;font:700 .82rem ui-monospace,monospace}.toggle{display:flex;align-items:center;gap:8px;margin-top:9px;min-height:44px}input{width:24px;height:24px}</style></head><body><h1>Score Cats · actual 120×120 runtime size</h1><main class="board"><section class="end"><div class="cat" data-cat="player2"></div><div class="score">2</div></section><section class="end"><div class="cat" data-cat="player1"></div><div class="score">3</div></section></main><section class="panel"><div class="buttons" data-states></div><div class="buttons" data-players></div><label class="toggle"><input type="checkbox" data-reduced> Reduced motion</label><div class="status"><span data-status-player1></span><span data-status-player2></span></div></section><script>
const images=${JSON.stringify(images)};const cats={player1:document.querySelector('[data-cat=player1]'),player2:document.querySelector('[data-cat=player2]')};const states=['Idle','Goal','Conceded','Win','Defeated'];let state='Idle',active='player1',reduced=false,start=performance.now();
for(const name of states){const b=document.createElement('button');b.textContent=name;b.addEventListener('click',()=>{state=name;start=performance.now();syncButtons()});document.querySelector('[data-states]').append(b)}for(const id of ['player1','player2']){const b=document.createElement('button');b.textContent=id==='player1'?'Player 1':'Player 2';b.addEventListener('click',()=>{active=id;start=performance.now();syncButtons()});document.querySelector('[data-players]').append(b)}document.querySelector('[data-reduced]').addEventListener('change',e=>{reduced=e.target.checked;start=performance.now()});
function syncButtons(){document.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===state||b.textContent===(active==='player1'?'Player 1':'Player 2'))))}function choose(id,age){const winner=id===active;if(state==='Idle')return Math.floor(age/1000*60)%150>=144?1:0;if(state==='Goal')return winner?(reduced?5:age<220?2:age<500?3:age<860?4:5):(reduced?8:age<280?6:age<760?7:8);if(state==='Conceded')return winner?(reduced?8:age<280?6:age<760?7:8):0;if(state==='Win')return winner?(reduced?14:age<280?9:age<620?10:age<1000?11:age<1450?12:age<1950?13:14):15;if(state==='Defeated')return winner?15:0;return 0}function render(now){const age=now-start;for(const id of Object.keys(cats)){const frame=choose(id,age);const col=frame%${descriptor.sheet.columns},row=Math.floor(frame/${descriptor.sheet.columns});cats[id].style.backgroundImage='url('+images[id]+')';cats[id].style.backgroundPosition=(-col*120)+'px '+(-row*120)+'px';document.querySelector('[data-status-'+id+']').textContent=(id==='player1'?'P1 ':'P2 ')+state+' · frame '+frame}requestAnimationFrame(render)}syncButtons();requestAnimationFrame(render);
</script></body></html>\n`;
}

const godotExecutable = argument("--godot-executable") ?? process.env.GODOT_EXE;
if (!godotExecutable) throw new Error("Pass --godot-executable or set GODOT_EXE.");
const versionResult = spawnSync(godotExecutable, ["--version"], { encoding: "utf8" });
if (versionResult.status !== 0) throw new Error(`Godot version check failed: ${versionResult.stderr}`);
const godotVersion = versionResult.stdout.trim();
if (!godotVersion.startsWith("4.7.1.stable")) throw new Error(`Expected Godot 4.7.1 stable, received ${godotVersion}.`);
await mkdir(resolve(repositoryRoot, "art/score-cats"), { recursive: true }); await mkdir(dirname(previewPath), { recursive: true });
const descriptor = JSON.parse(await readFile(descriptorPath, "utf8"));
if (descriptor.frames.length !== 16 || descriptor.sheet.columns !== 4 || descriptor.sheet.rows !== 4) throw new Error("Score-cat descriptor must define exactly 16 frames in a 4x4 sheet.");
const run = spawnSync(godotExecutable, ["--windowed", "--resolution", "80x80", "--rendering-method", "gl_compatibility", "--path", projectRoot, "--script", "res://scripts/export_score_cats.gd", "--", "--descriptor", descriptorPath, "--repository-root", repositoryRoot, "--render-report", renderReportPath], { encoding: "utf8", windowsHide: true, env: { ...process.env, HTTP_PROXY: "", HTTPS_PROXY: "", ALL_PROXY: "", NO_PROXY: "*" } });
if (run.status !== 0) throw new Error(`Godot score-cat export failed (${run.status}).\n${run.stdout}\n${run.stderr}`);
const outputs = [];
for (const variant of descriptor.variants) { const path = resolve(repositoryRoot, variant.output); const bytes = await readFile(path); const validation = validateSheet(bytes, descriptor, variant.id); outputs.push({ variant, path, bytes, validation }); }
for (let index = 0; index < descriptor.frames.length; index += 1) if (!outputs[0].validation.alphaFrames[index].equals(outputs[1].validation.alphaFrames[index])) throw new Error(`P1/P2 alpha silhouettes differ in frame ${index}.`);
const renderReport = JSON.parse(await readFile(renderReportPath, "utf8"));
const metadata = canonical({ schema: "cat-paw.score-cat-export-metadata@1", godot: { version: godotVersion, renderingMethod: renderReport.renderer, executionMode: "hidden-window-cli", supportedVersion: "4.7.1 stable only", officialWindowsArchiveSha256: "c7a289051eaefb460b0106b60e9cd5bee0ef55fd102dcb2bed1eb356cf3d90a1" }, descriptor: { path: "tools/godot-score-cats/manifests/score-cat-export.json", sha256: sha256(await readFile(descriptorPath)) }, frameCount: descriptor.frames.length, workingFrame: descriptor.workingFrame, scale: descriptor.scale, sheet: descriptor.sheet, anchor: descriptor.anchor, outputs: outputs.map(({ variant, bytes }) => ({ variant: variant.id, path: variant.output, bytes: bytes.length, sha256: sha256(bytes) })) });
const report = canonical({ schema: "cat-paw.score-cat-validation@1", valid: true, checks: ["dimensions", "rgba8", "transparency", "binary-alpha", "cell-boundaries", "ground-registration", "adjacent-frame-distinctness", "cross-palette-silhouette-parity", "row-major-order"], frames: outputs[0].validation.frames, outputs: outputs.map(({ variant, bytes, validation }) => ({ variant: variant.id, bytes: bytes.length, sha256: sha256(bytes), frames: validation.frames })) });
await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`); await writeFile(validationPath, `${JSON.stringify(report, null, 2)}\n`); await writeFile(previewPath, previewHtml(outputs[0].bytes, outputs[1].bytes, descriptor));
console.log(JSON.stringify({ ok: true, godotVersion, metadata: metadataPath, validation: validationPath, preview: previewPath, outputs: metadata.outputs }, null, 2));
