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
  assert.equal(await page.locator("#pixi-host canvas").count(), 1);
  assert.equal(await page.locator("canvas").count(), 1);

  const viewport = page.viewportSize()!;
  for (const end of ["top", "bottom"] as const) {
    const apron = page.locator(`.edge-controls--${end} .goal-apron`);
    const leftPair = page.locator(`.edge-controls--${end} .control-pair--left`);
    const rightPair = page.locator(`.edge-controls--${end} .control-pair--right`);
    const [apronBox, leftBox, rightBox] = await Promise.all([apron.boundingBox(), leftPair.boundingBox(), rightPair.boundingBox()]);
    assert.ok(apronBox && leftBox && rightBox);
    const screenLeft = end === "top" ? rightBox : leftBox;
    const screenRight = end === "top" ? leftBox : rightBox;
    assert.ok(screenLeft.x + screenLeft.width <= apronBox.x && apronBox.x + apronBox.width <= screenRight.x, `${end} controls split around the goal apron`);
    for (const box of [screenLeft, screenRight]) assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height, `${end} control pair remains in the viewport`);
  }
  const topFullscreen = await page.locator(".edge-controls--top [data-action='fullscreen']").boundingBox();
  const topPause = await page.locator(".edge-controls--top [data-action='pause']").boundingBox();
  const bottomMute = await page.locator(".edge-controls--bottom [data-action='mute']").boundingBox();
  const bottomFullscreen = await page.locator(".edge-controls--bottom [data-action='fullscreen']").boundingBox();
  assert.ok(topFullscreen && topPause && bottomMute && bottomFullscreen);
  assert.ok(topFullscreen.x < topPause.x, "top arrangement is mirrored");
  assert.ok(bottomMute.x < bottomFullscreen.x, "bottom arrangement follows Player 1 reading direction");

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
  await page.locator("[data-menu-action='close']").last().click();
  await page.waitForFunction(() => (document.querySelector("#settings-overlay") as HTMLElement).hidden);
  await page.locator("[data-action='pause']").last().click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "ready");

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
  await page.locator("[data-action='pause']").last().click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
  await page.waitForFunction(() => document.querySelector("[data-action='pause']")?.getAttribute("aria-label") === "Resume");
  await page.locator("[data-action='pause']").last().click();
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
  assert.deepEqual(requests, ["/"]);
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
