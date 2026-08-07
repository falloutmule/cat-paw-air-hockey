import assert from "node:assert/strict";
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

console.log(JSON.stringify({ schema: "cat-air-hockey.fullscreen@1", passed: true, checks: 11 }, null, 2));
