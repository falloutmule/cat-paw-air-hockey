import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const playwrightResolver = process.env.SFHS_PLAYWRIGHT_RESOLVER
  ?? resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json");
const { chromium } = createRequire(realpathSync(playwrightResolver))("playwright") as {
  readonly chromium: { launch(options: { readonly headless: boolean }): Promise<any> };
};

const artifactPath = resolve(process.cwd(), "dist", "index.html");
const bytes = await readFile(artifactPath);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const requests: string[] = [];
const pageErrors: string[] = [];
const consoleErrors: string[] = [];

const server = createServer((request, response) => {
  requests.push(request.url ?? "");
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": bytes.byteLength });
  response.end(bytes);
});
await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", () => resolvePromise()));
const address = server.address();
if (address === null || typeof address === "string") throw new Error("Unable to allocate canonical artifact server.");
const url = `http://127.0.0.1:${address.port}/`;

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await context.route("**/*", async (route) => {
    const requestUrl = route.request().url();
    if (requestUrl === url || /^(?:about:blank|blob:|data:)/u.test(requestUrl)) await route.continue();
    else {
      pageErrors.push(`Unexpected runtime request: ${requestUrl}`);
      await route.abort();
    }
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  const response = await page.goto(url, { waitUntil: "load" });
  assert.ok(response);
  assert.equal(createHash("sha256").update(await response.body()).digest("hex"), sha256);
  await page.waitForFunction(() => Boolean(window.__CAT_AIR_HOCKEY__));
  await page.waitForFunction(() => window.__CAT_AIR_HOCKEY__?.snapshot() !== undefined);

  const initial = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(initial.renderer.renderer, "PIXI");
  assert.equal(initial.state.phase, "ready");
  assert.equal(initial.board.mode, "default");
  assert.equal(initial.board.spriteCount, 1);
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "default");
  assert.equal(await page.locator("#pixi-host canvas").count(), 1);
  assert.equal(await page.locator("canvas").count(), 1);

  const viewport = page.viewportSize()!;
  assert.equal(await page.locator(".shared-controls").count(), 1);
  assert.equal(await page.locator("[data-action]").count(), 5, "four live controls plus the winner-only Capture alternate");
  for (const action of ["mute", "pause", "menu", "fullscreen", "capture"] as const) assert.equal(await page.locator(`[data-action='${action}']`).count(), 1, `${action} is not duplicated`);
  assert.equal(await page.locator("[data-action]:visible").count(), 4);
  const boxes = Object.fromEntries(await Promise.all((["mute", "pause", "menu", "fullscreen"] as const).map(async (action) => [action, await page.locator(`[data-action='${action}']`).boundingBox()]))) as Record<string, { x: number; y: number; width: number; height: number }>;
  for (const [action, box] of Object.entries(boxes)) { assert.ok(box); assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height, `${action} remains in safe viewport`); assert.ok(box.width >= 42 && box.height >= 42, `${action} keeps a practical touch target`); assert.ok(Math.abs(box.y + box.height / 2 - viewport.height / 2) < 70, `${action} stays at the center edge`); }
  assert.ok(boxes.mute.x < viewport.width / 2 && boxes.pause.x < viewport.width / 2);
  assert.ok(boxes.menu.x > viewport.width / 2 && boxes.fullscreen.x > viewport.width / 2);
  assert.ok(boxes.mute.y < viewport.height / 2 && boxes.menu.y < viewport.height / 2);
  assert.ok(boxes.pause.y > viewport.height / 2 && boxes.fullscreen.y > viewport.height / 2);
  const scale = initial.renderer.viewport.scaleY; const offsetY = initial.renderer.viewport.offsetY;
  const topGoalY = offsetY + 54 * scale; const bottomGoalY = offsetY + 906 * scale;
  for (const box of Object.values(boxes)) { const centerY = box.y + box.height / 2; assert.ok(Math.abs(centerY - topGoalY) > 180 && Math.abs(centerY - bottomGoalY) > 180, "shared control remains outside both defensive goal zones"); }

  await page.locator("[data-action='menu']").last().click();
  await page.waitForFunction(() => !(document.querySelector("#settings-overlay") as HTMLElement).hidden);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
  const puckSpeed = page.locator(".settings-view--bottom input[data-setting='puckSpeed']");
  await puckSpeed.evaluate((input) => { (input as HTMLInputElement).value = "130"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForFunction(() => (document.querySelector(".settings-view--top input[data-setting='puckSpeed']") as HTMLInputElement).value === "130");
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.activeMatchSettings.puckSpeed === 130);
  const returnSpeed = page.locator(".settings-view--bottom input[data-setting='returnSpeed1']");
  assert.match(await returnSpeed.evaluate((input) => input.closest("label")?.textContent ?? ""), /Player 1 return speed/);
  await returnSpeed.evaluate((input) => { (input as HTMLInputElement).value = "70"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForFunction(() => (document.querySelector(".settings-view--top input[data-setting='returnSpeed1']") as HTMLInputElement).value === "70");
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.activeMatchSettings.returnSpeed[1] === 70);
  const returnSpeed2 = page.locator(".settings-view--bottom input[data-setting='returnSpeed2']");
  assert.equal(await returnSpeed2.count(), 1);
  assert.match(await returnSpeed2.evaluate((input) => input.closest("label")?.textContent ?? ""), /Player 2 return speed/);
  assert.equal(await page.locator(".settings-view--bottom [data-menu-action='board-template']").count(), 1);
  assert.equal(await page.locator(".settings-view--bottom [data-menu-action='load-board']").count(), 1);
  assert.equal(await page.locator(".settings-view--bottom [data-menu-action='reset-board']").count(), 1);
  const physicsBeforeBoard = await page.evaluate(() => { const snapshot = window.__CAT_AIR_HOCKEY__!.snapshot() as any; return { phase: snapshot.state.phase, scores: snapshot.state.scores, puck: snapshot.state.puck, players: snapshot.state.players, settings: snapshot.state.activeMatchSettings, stageObjects: snapshot.renderer.stage.meaningfulObjectCount }; });
  const boardPng = await page.evaluate(async () => { const canvas = new OffscreenCanvas(1080, 1920); const context = canvas.getContext("2d")!; context.fillStyle = "#13263a"; context.fillRect(0, 0, 1080, 1920); context.fillStyle = "#41d8c7"; context.fillRect(0, 930, 1080, 60); context.fillStyle = "#ff8c78"; context.fillRect(500, 0, 80, 1920); const blob = await canvas.convertToBlob({ type: "image/png" }); return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))); });
  await page.locator("#board-file").setInputFiles({ name: "r2-custom-board.png", mimeType: "image/png", buffer: Buffer.from(boardPng, "base64") });
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "custom");
  let boardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(boardSnapshot.board.mode, "custom");
  assert.equal(boardSnapshot.board.spriteCount, 1);
  assert.equal(boardSnapshot.renderer.stage.meaningfulObjectCount, physicsBeforeBoard.stageObjects);
  assert.deepEqual({ phase: boardSnapshot.state.phase, scores: boardSnapshot.state.scores, puck: boardSnapshot.state.puck, players: boardSnapshot.state.players, settings: boardSnapshot.state.activeMatchSettings, stageObjects: boardSnapshot.renderer.stage.meaningfulObjectCount }, physicsBeforeBoard);
  const wrongPng = await page.evaluate(async () => { const canvas = new OffscreenCanvas(100, 100); const context = canvas.getContext("2d")!; context.fillStyle = "#123456"; context.fillRect(0, 0, 100, 100); const blob = await canvas.convertToBlob({ type: "image/png" }); return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))); });
  await page.locator("#board-file").setInputFiles({ name: "wrong-size.png", mimeType: "image/png", buffer: Buffer.from(wrongPng, "base64") });
  await page.waitForFunction(() => [...document.querySelectorAll("[data-board-status]")].some((element) => element.textContent?.includes("received 100 × 100")));
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "custom");
  await page.locator("#board-file").setInputFiles({ name: "corrupt.png", mimeType: "image/png", buffer: Buffer.from("not-a-png") });
  await page.waitForFunction(() => [...document.querySelectorAll("[data-board-status]")].some((element) => element.textContent?.includes("could not be decoded")));
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "custom");
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state != null);
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "custom");
  boardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(boardSnapshot.board.mode, "custom");
  await page.locator("[data-action='menu']").click();
  await page.locator(".settings-view--bottom [data-menu-action='reset-board']").click();
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "default");
  boardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(boardSnapshot.board.mode, "default");
  assert.ok(boardSnapshot.board.disposedOwnedTextureCount >= 1);
  await page.locator("[data-menu-action='close']").last().click();
  await page.waitForFunction(() => (document.querySelector("#settings-overlay") as HTMLElement).hidden);
  await page.locator("[data-action='pause']").last().click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "ready");
  await page.locator("[data-action='fullscreen']").click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  assert.equal(await page.locator("[data-action='fullscreen']").getAttribute("aria-pressed"), "true");
  await page.locator("[data-action='fullscreen']").click();
  await page.waitForFunction(() => document.fullscreenElement === null);
  assert.equal(await page.locator("[data-action='fullscreen']").getAttribute("aria-pressed"), "false");

  const rink = await page.locator("#pixi-host").boundingBox();
  assert.ok(rink);
  const dispatchPointer = async (type: string, pointerId: number, yFraction: number): Promise<void> => {
    await page.locator("#pixi-host").dispatchEvent(type, {
      pointerId,
      pointerType: "touch",
      isPrimary: pointerId === 101,
      clientX: rink.x + rink.width / 2,
      clientY: rink.y + rink.height * yFraction,
      bubbles: true,
      cancelable: true
    });
  };
  await dispatchPointer("pointerdown", 101, 0.8);
  await dispatchPointer("pointerdown", 202, 0.2);
  await dispatchPointer("pointerdown", 303, 0.75);
  let snapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.deepEqual(snapshot.input.owners, { 1: 101, 2: 202 });
  assert.equal(snapshot.input.ignoredPointerCount, 1);
  assert.equal(snapshot.audio, "ready");

  await dispatchPointer("pointerup", 101, 0.8);
  snapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.deepEqual(snapshot.input.owners, { 1: null, 2: 202 });
  await dispatchPointer("pointercancel", 202, 0.2);
  snapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.deepEqual(snapshot.input.owners, { 1: null, 2: null });

  await dispatchPointer("pointerdown", 111, 0.8);
  await dispatchPointer("pointerdown", 222, 0.2);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "countdown", undefined, { timeout: 3_000 });
  assert.equal(await page.locator("[data-action='fullscreen']").count(), 1);
  assert.equal(await page.locator("[data-action='fullscreen']").isVisible(), true);
  await page.locator("[data-action='pause']").click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
  await page.waitForFunction(() => document.querySelector("[data-action='pause']")?.getAttribute("aria-label") === "Resume");
  await page.locator("[data-action='pause']").click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase !== "paused");
  await page.waitForFunction(() => document.querySelector("[data-action='pause']")?.getAttribute("aria-label") === "Pause");

  await page.setViewportSize({ width: 915, height: 412 });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).orientationGateActive === true);
  snapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(snapshot.renderer.paused, true);
  await page.setViewportSize({ width: 412, height: 915 });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).orientationGateActive === false);
  snapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(snapshot.renderer.paused, false);
  assert.equal(snapshot.renderer.viewport.orientation, "portrait");

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(requests, ["/", "/"]);
  const report = { schema: "cat-air-hockey.canonical-browser@1", valid: true, artifact: { path: "dist/index.html", bytes: bytes.byteLength, sha256 }, browser: await browser.version(), canvasCount: 1, requests, pageErrors, consoleErrors, snapshot };
  if (process.env.SFHS_BROWSER_REPORT !== undefined) {
    const reportPath = resolve(process.env.SFHS_BROWSER_REPORT);
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify(report, null, 2));
  await context.close();
} finally {
  await browser.close();
  await new Promise<void>((resolvePromise, reject) => server.close((error) => error === undefined ? resolvePromise() : reject(error)));
}
