import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const toolRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolRoot, "../..");
const arguments_ = process.argv.slice(2);

function option(name) {
  const index = arguments_.indexOf(name);
  return index < 0 ? undefined : arguments_[index + 1];
}

const godotExecutable = option("--godot-executable") ?? process.env.SFHS_GODOT_EXECUTABLE;
const sfhsRoot = resolve(option("--sfhs-root") ?? process.env.SFHS_ROOT ?? resolve(repositoryRoot, ".sfhs-godot-animation-workflow"));
if (!godotExecutable) throw new Error("Pass --godot-executable or set SFHS_GODOT_EXECUTABLE.");

const modulePath = resolve(sfhsRoot, "packages/godot-animation/src/index.ts");
const { exportGodotAnimation } = await import(pathToFileURL(modulePath).href);
const descriptorPaths = [
  "tools/godot-gameplay-actors/manifests/paw-export.json",
  "tools/godot-gameplay-actors/manifests/puck-export.json"
];

const results = [];
for (const descriptorPath of descriptorPaths) {
  results.push(await exportGodotAnimation({ projectRoot: repositoryRoot, descriptorPath, godotExecutable }));
}

const imagePaths = {
  paw1: "art/gameplay-actors/cat-paw-player1.png",
  paw2: "art/gameplay-actors/cat-paw-player2.png",
  puckNeutral: "art/gameplay-actors/cat-paw-puck-neutral.png",
  puck1: "art/gameplay-actors/cat-paw-puck-player1.png",
  puck2: "art/gameplay-actors/cat-paw-puck-player2.png"
};
const images = Object.fromEntries(await Promise.all(Object.entries(imagePaths).map(async ([key, path]) => [key, (await readFile(resolve(repositoryRoot, path))).toString("base64")])));
const frameTimes = [0, 80, 170, 280, 400, 520, 640];
const preview = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"><title>Cat Paw Gameplay Actor Preview</title><style>
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#172331;color:#fff4d6}*{box-sizing:border-box}body{margin:0;min-height:100dvh;padding:max(12px,env(safe-area-inset-top)) 12px max(16px,env(safe-area-inset-bottom));background:linear-gradient(#213b49,#172331)}h1{margin:0 0 10px;text-align:center;font-size:1.15rem}.board{position:relative;margin:auto;width:min(100%,540px);aspect-ratio:9/16;border:4px solid #5d3d29;border-radius:18px;overflow:hidden;background:linear-gradient(#d96f9a 0 19%,#ef9fbd 19% 81%,#d96f9a 81%);box-shadow:0 10px 24px #0008}.actor{position:absolute;image-rendering:pixelated;background-repeat:no-repeat;transform-origin:center}.paw{width:224px;height:224px;background-size:896px 448px;left:calc(50% - 112px)}.paw.p2{top:2%;transform:rotate(180deg)}.paw.p1{bottom:2%}.puck{width:128px;height:128px;background-size:512px 256px;left:calc(50% - 64px);top:calc(50% - 64px);transform:rotate(var(--angle))}.paw.p1{background-image:url(data:image/png;base64,${images.paw1})}.paw.p2{background-image:url(data:image/png;base64,${images.paw2})}.puck.neutral{background-image:url(data:image/png;base64,${images.puckNeutral})}.puck.player1{background-image:url(data:image/png;base64,${images.puck1})}.puck.player2{background-image:url(data:image/png;base64,${images.puck2})}.panel{position:sticky;bottom:0;margin:10px auto 0;max-width:540px;padding:10px;border-radius:14px;background:#101821f2;border:1px solid #ffffff22}.buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}button{min-height:44px;border:0;border-radius:10px;font:700 .9rem system-ui;background:#fff4d6;color:#30233a}button[aria-pressed=true]{background:#ffd45c}label{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;margin-top:9px}input[type=range]{width:100%}input[type=checkbox]{width:24px;height:24px}.status{margin-top:8px;font:700 .78rem ui-monospace,monospace;white-space:pre-wrap}</style></head><body><h1>Godot puck + paws · actual 200% runtime scale</h1><main class="board"><div class="actor paw p2" data-paw="2"></div><div class="actor puck neutral" data-puck></div><div class="actor paw p1" data-paw="1"></div></main><section class="panel"><div class="buttons"><button data-player="1" aria-pressed="true">Player 1 hit</button><button data-player="2" aria-pressed="false">Player 2 hit</button><button data-replay>Replay contact</button></div><label>Direction <input type="range" min="-180" max="180" value="-90" step="5" data-angle><output data-angle-output>-90°</output></label><label>Strength <input type="range" min="8" max="100" value="100" step="1" data-strength><output data-strength-output>100%</output></label><label><input type="checkbox" data-reduced> Reduced motion <span></span></label><div class="status" data-status></div></section><script>
const times=${JSON.stringify(frameTimes)};let player=1;let timers=[];let frame=0;const paw1=document.querySelector('[data-paw="1"]');const paw2=document.querySelector('[data-paw="2"]');const puck=document.querySelector('[data-puck]');const status=document.querySelector('[data-status]');const angle=document.querySelector('[data-angle]');const strength=document.querySelector('[data-strength]');const reduced=document.querySelector('[data-reduced]');
function position(element,index,cell){element.style.backgroundPosition=\`-\${index%4*cell}px -\${Math.floor(index/4)*cell}px\`;}
function render(){position(puck,frame,128);position(paw1,player===1?frame:0,224);position(paw2,player===2?frame:0,224);puck.className=\`actor puck player\${player}\`;puck.style.setProperty('--angle',\`\${angle.value}deg\`);status.textContent=\`P\${player} contact · frame \${frame} · \${strength.value}% · \${angle.value}°\nPuck palette player\${player} · reduced motion \${reduced.checked?'on':'off'}\`;document.querySelector('[data-angle-output]').value=\`\${angle.value}°\`;document.querySelector('[data-strength-output]').value=\`\${strength.value}%\`;}
function replay(){timers.forEach(clearTimeout);timers=[];if(reduced.checked){frame=0;render();return;}times.forEach((time,index)=>timers.push(setTimeout(()=>{frame=index+1;render();},time)));timers.push(setTimeout(()=>{frame=0;render();},660));}
document.querySelectorAll('[data-player]').forEach(button=>button.addEventListener('click',()=>{player=Number(button.dataset.player);document.querySelectorAll('[data-player]').forEach(candidate=>candidate.setAttribute('aria-pressed',String(Number(candidate.dataset.player)===player)));replay();}));document.querySelector('[data-replay]').addEventListener('click',replay);angle.addEventListener('input',render);strength.addEventListener('input',render);reduced.addEventListener('change',replay);render();replay();
</script></body></html>`;

const previewPath = resolve(repositoryRoot, "test-results/PUCK-PAW-GODOT-001/phone/puck-paw-preview.html");
await mkdir(dirname(previewPath), { recursive: true });
await writeFile(previewPath, preview, "utf8");

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const outputs = [];
for (const path of Object.values(imagePaths)) {
  const bytes = await readFile(resolve(repositoryRoot, path));
  outputs.push({ path, bytes: bytes.length, sha256: sha256(bytes) });
}
const previewBytes = await readFile(previewPath);
process.stdout.write(`${JSON.stringify({ schema: "cat-paw.gameplay-actor-build@1", valid: true, sfhsCommit: "37aa056b6bd0948d73fcd99c1aba558861f0037e", godot: results[0].godot, outputs, preview: { path: "test-results/PUCK-PAW-GODOT-001/phone/puck-paw-preview.html", bytes: previewBytes.length, sha256: sha256(previewBytes) } }, null, 2)}\n`);
