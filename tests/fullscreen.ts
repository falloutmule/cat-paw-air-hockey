import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fullscreenAvailable, fullscreenElement, toggleElementFullscreen } from "../src/fullscreen.ts";

function fakeDocument(overrides: Record<string, unknown> = {}): Document {
  return { fullscreenElement: null, ...overrides } as unknown as Document;
}

let standardRequested = 0;
const standardTarget = { requestFullscreen: async () => { standardRequested += 1; } } as unknown as HTMLElement;
const standardDocument = fakeDocument();
assert.equal(fullscreenAvailable(standardTarget, standardDocument), true);
assert.equal(fullscreenElement(standardDocument), null);
await toggleElementFullscreen(standardTarget, standardDocument);
assert.equal(standardRequested, 1);

let webkitRequested = 0;
const webkitTarget = { webkitRequestFullscreen: () => { webkitRequested += 1; } } as unknown as HTMLElement;
const webkitDocument = fakeDocument({ fullscreenEnabled: false, webkitFullscreenEnabled: true });
assert.equal(fullscreenAvailable(webkitTarget, webkitDocument), true, "prefixed mobile API remains usable when the standard flag is false");
await toggleElementFullscreen(webkitTarget, webkitDocument);
assert.equal(webkitRequested, 1);

let exited = 0;
const activeElement = {} as Element;
const activeDocument = fakeDocument({ webkitFullscreenElement: activeElement, webkitExitFullscreen: () => { exited += 1; } });
assert.equal(fullscreenElement(activeDocument), activeElement);
await toggleElementFullscreen({} as HTMLElement, activeDocument);
assert.equal(exited, 1);

assert.equal(fullscreenAvailable({} as HTMLElement, fakeDocument({ fullscreenEnabled: false })), false);
await assert.rejects(() => toggleElementFullscreen({} as HTMLElement, fakeDocument()), /Fullscreen is unavailable/);

const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const pointerdownHandler = mainSource.match(/button\.addEventListener\("pointerdown",[^\n]+/u)?.[0] ?? "";
const clickHandler = mainSource.match(/button\.addEventListener\("click",[^\n]+toggleFullscreen\(\)[^\n]+/u)?.[0] ?? "";
assert.doesNotMatch(pointerdownHandler, /toggleFullscreen/u, "touch pointerdown must not spend fullscreen activation before pointerup");
assert.match(clickHandler, /toggleFullscreen/u, "trusted click owns the fullscreen request");
assert.doesNotMatch(mainSource, /suppressFullscreenClickUntil/u, "the valid post-pointerup click is never suppressed");

console.log(JSON.stringify({ schema: "cat-air-hockey.fullscreen@1", passed: true, checks: 14 }, null, 2));
