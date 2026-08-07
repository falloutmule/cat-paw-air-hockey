import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SHARED_CONTROL_POSITIONS, lowerLeftControl } from "../src/controls.ts";
import { RINK } from "../src/constants.ts";

assert.deepEqual(SHARED_CONTROL_POSITIONS, { mute: "upper-left", pause: "lower-left", capture: "lower-left", menu: "upper-right", fullscreen: "lower-right" });
assert.equal(lowerLeftControl("won"), "capture");
for (const phase of ["ready", "countdown", "playing", "goal", "paused"] as const) assert.equal(lowerLeftControl(phase), "pause");
assert.deepEqual({ top: RINK.top, bottom: RINK.bottom, left: RINK.left, right: RINK.right }, { top: 54, bottom: 906, left: 42, right: 498 });
const markup = readFileSync(new URL("../src/index.html", import.meta.url), "utf8");
for (const action of ["mute", "pause", "menu", "fullscreen", "capture"]) assert.equal(markup.match(new RegExp(`data-action="${action}"`, "gu"))?.length, 1, `${action} exists once`);
assert.equal(markup.match(/class="shared-controls"/gu)?.length, 1);
assert.equal(markup.includes("edge-controls"), false);
console.log(JSON.stringify({ schema: "cat-air-hockey.shared-controls@1", passed: true, checks: 19 }, null, 2));
