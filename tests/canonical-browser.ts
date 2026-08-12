import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const playwrightResolver = process.env.SFHS_PLAYWRIGHT_RESOLVER
  ?? resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json");
const { chromium } = createRequire(realpathSync(playwrightResolver))("playwright") as {
  readonly chromium: { launch(options: { readonly headless: boolean }): Promise<any> };
};

const artifactPath = resolve(process.env.CAT_PAW_ARTIFACT ?? resolve(process.cwd(), "dist", "index.html"));
const bytes = await readFile(artifactPath);
const sha256 = createHash("sha256").update(bytes).digest("hex");
const screenshotDirectory = resolve(process.env.CAT_PAW_SCREENSHOT_DIR ?? "test-results/CATPAW-EXPANSION-001-R3/packed-browser");
await mkdir(screenshotDirectory, { recursive: true });
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
  await page.waitForFunction(() => ((window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state?.tick ?? 0) > 0);

  const initial = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(initial.renderer.renderer, "PIXI");
  assert.equal(initial.physics.backend, "rapier2d");
  assert.ok(Number.isFinite(initial.physics.initializationMilliseconds));
  assert.equal(initial.state.phase, "ready");
  assert.equal(initial.board.mode, "default");
  assert.equal(initial.board.spriteCount, 1);
  assert.deepEqual(initial.board.logicalBounds, { x: 0, y: 0, width: 540, height: 1200 });
  assert.deepEqual(initial.board.spriteLogicalSize, { width: 540, height: 1200 });
  assert.deepEqual(initial.board.bitmapPixels, { width: 1080, height: 2400 });
  assert.deepEqual(initial.goals, { architecture: "pixi-nine-slice", textureSampling: "nearest", top: { openingWidth: 368, visualWidth: 416, labelScale: 1.1, rotation: Math.PI }, bottom: { openingWidth: 368, visualWidth: 416, labelScale: 1.1, rotation: 0 } });
  assert.equal(initial.paws.top.nominalDiameter, 180);
  assert.equal(initial.paws.bottom.nominalDiameter, 180);
  assert.deepEqual({ frame: initial.paws.top.frame, sheet: initial.paws.top.sheet, anchor: initial.paws.top.anchor, presentation: initial.paws.top.presentation }, { frame: 0, sheet: "cat-paw-player2.png", anchor: { x: 0.5, y: 0.5 }, presentation: "godot-sheet" });
  assert.deepEqual({ frame: initial.paws.bottom.frame, sheet: initial.paws.bottom.sheet, anchor: initial.paws.bottom.anchor, presentation: initial.paws.bottom.presentation }, { frame: 0, sheet: "cat-paw-player1.png", anchor: { x: 0.5, y: 0.5 }, presentation: "godot-sheet" });
  assert.deepEqual({ nominalDiameter: initial.puckPresentation.nominalDiameter, owner: initial.puckPresentation.owner, palette: initial.puckPresentation.palette, frame: initial.puckPresentation.frame, sheet: initial.puckPresentation.sheet, anchor: initial.puckPresentation.anchor, renderedScaleX: initial.puckPresentation.renderedScaleX, renderedScaleY: initial.puckPresentation.renderedScaleY, contactPlayer: initial.puckPresentation.contactPlayer, presentation: initial.puckPresentation.presentation }, { nominalDiameter: 92, owner: null, palette: "neutral", frame: 0, sheet: "cat-paw-puck-neutral.png", anchor: { x: 0.5, y: 0.5 }, renderedScaleX: 1, renderedScaleY: 1, contactPlayer: null, presentation: "godot-sheet" });
  assert.deepEqual(initial.scoreCats.top.scale, { x: 1, y: 1 });
  assert.deepEqual(initial.scoreCats.bottom.scale, { x: 1, y: 1 });
  assert.deepEqual(initial.scoreCats.top.anchor, { x: 0.5, y: 0.9 });
  assert.deepEqual(initial.scoreCats.bottom.anchor, { x: 0.5, y: 0.9 });
  assert.equal(initial.scoreCats.top.rotation, Math.PI);
  assert.equal(initial.scoreCats.bottom.rotation, 0);
  assert.equal(initial.scoreCats.top.frame, 0);
  assert.equal(initial.scoreCats.bottom.frame, 0);
  assert.notEqual(initial.board.logicalBounds.width, initial.board.bitmapPixels.width, "Board bitmap pixels do not become logical layout units");
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "default");
  assert.equal(await page.locator("#pixi-host canvas").count(), 1);
  assert.equal(await page.locator("canvas").count(), 1);
  await page.screenshot({ path: resolve(screenshotDirectory, "01-ready-412x915.png") });
  await page.screenshot({ path: resolve(screenshotDirectory, "05-goals-200-default.png") });
  const initialCanvas = await page.locator("#pixi-host canvas").boundingBox();
  assert.ok(initialCanvas);
  await page.screenshot({ path: resolve(screenshotDirectory, "07-couch-goal-detail.png"), clip: { x: initialCanvas.x, y: initialCanvas.y, width: initialCanvas.width, height: Math.max(1, initialCanvas.height * 0.14) } });

  await page.evaluate(async () => {
    localStorage.removeItem("cat-paw-air-hockey.settings.v3");
    localStorage.setItem("cat-paw-air-hockey.settings.v2", JSON.stringify({ puckSpeed: 75, pawSpeed: { 1: 75, 2: 75 }, returnSpeed: { 1: 75, 2: 75 }, puckSize: 125, pawSize: { 1: 125, 2: 125 }, goalSize: { 1: 125, 2: 125 } }));
    const db = await new Promise<IDBDatabase>((resolvePromise, reject) => { const request = indexedDB.open("cat-paw-air-hockey-theme-v1", 1); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains("themes")) request.result.createObjectStore("themes"); }; request.onsuccess = () => resolvePromise(request.result); request.onerror = () => reject(request.error); });
    await new Promise<void>((resolvePromise, reject) => { const request = db.transaction("themes", "readwrite").objectStore("themes").put({ filename: "legacy-r2-board.png", blob: new Blob(["legacy-r2"], { type: "image/png" }) }, "board-r2"); request.onsuccess = () => resolvePromise(); request.onerror = () => reject(request.error); });
    db.close();
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state != null);
  await page.waitForFunction(() => ((window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state?.tick ?? 0) > 0);
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-legacy-board") === "true");
  const migratedSettings = await page.evaluate(() => ({ active: (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.activeMatchSettings, stored: JSON.parse(localStorage.getItem("cat-paw-air-hockey.settings.v3") ?? "null") }));
  const expectedDefaults = { puckSpeed: 100, pawSpeed: { 1: 100, 2: 100 }, returnSpeed: { 1: 100, 2: 100 }, puckSize: 200, pawSize: { 1: 200, 2: 200 }, goalSize: { 1: 200, 2: 200 } };
  assert.deepEqual(migratedSettings.active, expectedDefaults, "v2 normal values migrate to the new 100% speed and 200% size defaults");
  assert.deepEqual(migratedSettings.stored, expectedDefaults, "migration is persisted under the v3 settings key");
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "default");
  assert.match((await page.locator(".settings-view--bottom [data-board-status]").textContent()) ?? "", /legacy-r2-board\.png.*incompatible.*1080 × 2400/u);

  const assertSettingsGeometry = async (width: number, height: number): Promise<void> => {
    await page.setViewportSize({ width, height });
    await page.waitForFunction(([expectedWidth, expectedHeight]) => {
      const viewport = (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.renderer?.viewport;
      return viewport?.presentedWidth === expectedWidth && viewport?.presentedHeight === expectedHeight;
    }, [width, height]);
    if (width === 360 && height === 640) await page.screenshot({ path: resolve(screenshotDirectory, "09-short-phone-360x640.png") });
    await page.locator("[data-action='menu']").click();
    await page.waitForFunction(() => !(document.querySelector("#settings-overlay") as HTMLElement).hidden);
    await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
    if (width === 412 && height === 915) {
      assert.equal(await page.locator(".settings-view--bottom input[data-setting='goalSize1']").getAttribute("aria-label"), "Player 1 goal size");
      const immediatelyReachableSizes = await page.evaluate(() => { const view = document.querySelector<HTMLElement>(".settings-view--bottom")!.getBoundingClientRect(); return ["goalSize1", "goalSize2", "pawSize1"].map((key) => { const rect = document.querySelector<HTMLElement>(`.settings-view--bottom input[data-setting='${key}']`)!.getBoundingClientRect(); return rect.top >= view.top && rect.bottom <= view.bottom; }); });
      assert.ok(immediatelyReachableSizes.every(Boolean), "goal sizes and Player 1 paw size are visible in the initial Samsung settings fold");
    }
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => { const value = document.querySelector<HTMLElement>(selector)!.getBoundingClientRect(); return { x: value.x, y: value.y, width: value.width, height: value.height, right: value.right, bottom: value.bottom }; };
      const top = document.querySelector<HTMLElement>(".settings-view--top")!;
      const bottom = document.querySelector<HTMLElement>(".settings-view--bottom")!;
      const visual = window.visualViewport;
      return {
        visual: { width: visual?.width ?? innerWidth, height: visual?.height ?? innerHeight },
        document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, clientWidth: document.documentElement.clientWidth, clientHeight: document.documentElement.clientHeight },
        shell: rect("#game-shell"), canvas: rect("#pixi-host canvas"), settings: rect("#settings-overlay"), top: rect(".settings-half--top"), bottom: rect(".settings-half--bottom"),
        controls: ["mute", "pause", "menu", "fullscreen"].map((action) => rect(`[data-action='${action}']`)),
        topScroll: { clientHeight: top.clientHeight, scrollHeight: top.scrollHeight }, bottomScroll: { clientHeight: bottom.clientHeight, scrollHeight: bottom.scrollHeight },
        topClose: rect(".settings-view--top .settings-close"), bottomClose: rect(".settings-view--bottom .settings-close")
      };
    });
    const epsilon = 1;
    const expectedScale = Math.min(width / 540, height / 1200);
    const expectedBoardWidth = 540 * expectedScale;
    const expectedBoardHeight = 1200 * expectedScale;
    assert.ok(Math.abs(geometry.canvas.width - expectedBoardWidth) <= epsilon && Math.abs(geometry.canvas.height - expectedBoardHeight) <= epsilon, "logical Board is uniformly contained without crop or stretch");
    assert.ok(Math.abs(geometry.canvas.x - (width - expectedBoardWidth) / 2) <= epsilon && Math.abs(geometry.canvas.y - (height - expectedBoardHeight) / 2) <= epsilon, "contained Board is centered in neutral screen margins");
    assert.ok(geometry.settings.width <= geometry.visual.width + epsilon && geometry.settings.height <= geometry.visual.height + epsilon);
    assert.equal(geometry.document.width, geometry.document.clientWidth, "settings own horizontal containment");
    assert.equal(geometry.document.height, geometry.document.clientHeight, "settings own vertical scrolling without growing the document");
    for (const half of [geometry.top, geometry.bottom]) { assert.ok(half.x >= -epsilon && half.y >= -epsilon && half.right <= geometry.visual.width + epsilon && half.bottom <= geometry.visual.height + epsilon); }
    assert.ok(geometry.topScroll.scrollHeight > geometry.topScroll.clientHeight && geometry.bottomScroll.scrollHeight > geometry.bottomScroll.clientHeight, "both settings halves own internal scrolling");
    for (const item of [geometry.topClose, geometry.bottomClose]) assert.ok(item.x >= -epsilon && item.y >= -epsilon && item.right <= geometry.visual.width + epsilon && item.bottom <= geometry.visual.height + epsilon, "sticky close controls remain visible");
    assert.equal(await page.locator("[data-settings-scroll]").count(), 0, "the large duplicate scroll sliders are removed");
    assert.ok(geometry.canvas.x >= -epsilon && geometry.canvas.y >= -epsilon && geometry.canvas.right <= geometry.visual.width + epsilon && geometry.canvas.bottom <= geometry.visual.height + epsilon);
    for (const control of geometry.controls) assert.ok(control.x >= -epsilon && control.y >= -epsilon && control.right <= geometry.visual.width + epsilon && control.bottom <= geometry.visual.height + epsilon, "shared controls remain inside the current safe screen bounds");
    const bottomScrollBeforeTop = await page.locator(".settings-view--bottom").evaluate((element) => element.scrollTop);
    await page.locator(".settings-view--top").evaluate((element) => { element.scrollTop = 120; });
    assert.ok(await page.locator(".settings-view--top").evaluate((element) => element.scrollTop) > 0);
    assert.equal(await page.locator(".settings-view--bottom").evaluate((element) => element.scrollTop), bottomScrollBeforeTop);
    const topScroll = await page.locator(".settings-view--top").evaluate((element) => element.scrollTop);
    await page.locator(".settings-view--bottom").evaluate((element) => { element.scrollTop = 140; });
    assert.equal(await page.locator(".settings-view--top").evaluate((element) => element.scrollTop), topScroll);
    assert.ok(await page.locator(".settings-view--bottom").evaluate((element) => element.scrollTop) > 0);
    await page.locator(".settings-view--bottom").evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await page.waitForFunction(() => { const view = document.querySelector<HTMLElement>(".settings-view--bottom")!; return view.scrollTop >= view.scrollHeight - view.clientHeight - 2; });
    assert.equal(await page.locator(".settings-view--top").evaluate((element) => element.scrollTop), topScroll, "Player 1 native scrollbar does not move Player 2 settings");
    assert.equal(await page.locator(".settings-view--bottom .settings-close").isVisible(), true, "Close remains visible at the end of the settings list");
    if (width === 412 && height === 915) await page.screenshot({ path: resolve(screenshotDirectory, "08-settings-1080x2400.png") });
    await page.locator(".settings-view--bottom [data-menu-action='close']").click();
    await page.waitForFunction(() => (document.querySelector("#settings-overlay") as HTMLElement).hidden);
  };
  for (const portrait of [{ width: 412, height: 915 }, { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 360, height: 640 }]) await assertSettingsGeometry(portrait.width, portrait.height);
  await page.setViewportSize({ width: 412, height: 915 });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.renderer?.viewport?.presentedHeight === 915);

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
  const topGoalY = offsetY + 54 * scale; const bottomGoalY = offsetY + 1146 * scale;
  for (const box of Object.values(boxes)) { const centerY = box.y + box.height / 2; assert.ok(Math.abs(centerY - topGoalY) > 180 && Math.abs(centerY - bottomGoalY) > 180, "shared control remains outside both defensive goal zones"); }

  await page.locator("[data-action='menu']").last().click();
  await page.waitForFunction(() => !(document.querySelector("#settings-overlay") as HTMLElement).hidden);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
  const sizeRanges = await page.locator(".settings-view--bottom input[data-setting]").evaluateAll((inputs) => Object.fromEntries(inputs.map((input) => [(input as HTMLInputElement).dataset.setting, { min: (input as HTMLInputElement).min, max: (input as HTMLInputElement).max, value: (input as HTMLInputElement).value }])));
  assert.deepEqual(sizeRanges.puckSize, { min: "25", max: "200", value: "200" });
  assert.deepEqual(sizeRanges.goalSize1, { min: "25", max: "200", value: "200" });
  assert.deepEqual(sizeRanges.puckSpeed, { min: "70", max: "130", value: "100" });
  const warningPuck = page.locator(".settings-view--bottom input[data-setting='puckSize']");
  const warningGoal = page.locator(".settings-view--bottom input[data-setting='goalSize1']");
  await warningPuck.evaluate((input) => { (input as HTMLInputElement).value = "200"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await warningGoal.evaluate((input) => { (input as HTMLInputElement).value = "25"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForFunction(() => document.querySelector(".settings-view--bottom [data-summary]")?.getAttribute("data-warning") === "true");
  assert.equal(await warningGoal.getAttribute("aria-invalid"), "true");
  assert.match((await page.locator(".settings-view--bottom [data-summary]").textContent()) ?? "", /cannot fit.*Closing is still allowed/u);
  await page.locator(".settings-view--bottom .settings-close").click();
  await page.waitForFunction(() => (document.querySelector("#settings-overlay") as HTMLElement).hidden);
  await page.locator("[data-action='menu']").click();
  await page.locator(".settings-view--bottom [data-menu-action='reset']").click();
  await page.waitForFunction(() => (document.querySelector(".settings-view--bottom input[data-setting='puckSize']") as HTMLInputElement).value === "200");
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
  const goalSize1 = page.locator(".settings-view--bottom input[data-setting='goalSize1']");
  const goalSize2 = page.locator(".settings-view--bottom input[data-setting='goalSize2']");
  await goalSize1.evaluate((input) => { (input as HTMLInputElement).value = "75"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await goalSize2.evaluate((input) => { (input as HTMLInputElement).value = "125"; input.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForFunction(() => { const goals = (window.__CAT_AIR_HOCKEY__!.snapshot() as any).goals; return goals.bottom.openingWidth === 138 && goals.top.openingWidth === 230; });
  const resizedGoals = await page.evaluate(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).goals);
  assert.deepEqual(resizedGoals.bottom, { openingWidth: 138, visualWidth: 186, labelScale: 0.9, rotation: 0 });
  assert.deepEqual(resizedGoals.top, { openingWidth: 230, visualWidth: 278, labelScale: 1.1, rotation: Math.PI });
  assert.equal(await page.locator(".settings-view--bottom [data-menu-action='board-template']").count(), 1);
  assert.equal(await page.locator(".settings-view--bottom [data-menu-action='load-board']").count(), 1);
  assert.equal(await page.locator(".settings-view--bottom [data-menu-action='reset-board']").count(), 1);
  const physicsBeforeBoard = await page.evaluate(() => { const snapshot = window.__CAT_AIR_HOCKEY__!.snapshot() as any; return { phase: snapshot.state.phase, scores: snapshot.state.scores, puck: snapshot.state.puck, players: snapshot.state.players, settings: snapshot.state.activeMatchSettings, stageObjects: snapshot.renderer.stage.meaningfulObjectCount }; });
  const boardPng = await page.evaluate(async () => { const canvas = new OffscreenCanvas(1080, 2400); const context = canvas.getContext("2d")!; context.fillStyle = "#13263a"; context.fillRect(0, 0, 1080, 2400); context.fillStyle = "#41d8c7"; context.fillRect(0, 1170, 1080, 60); context.fillStyle = "#ff8c78"; context.fillRect(500, 0, 80, 2400); const blob = await canvas.convertToBlob({ type: "image/png" }); return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))); });
  await page.locator("#board-file").setInputFiles({ name: "r3-custom-board-a.png", mimeType: "image/png", buffer: Buffer.from(boardPng, "base64") });
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "custom");
  let boardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(boardSnapshot.board.mode, "custom");
  assert.equal(boardSnapshot.board.spriteCount, 1);
  assert.equal(boardSnapshot.renderer.stage.meaningfulObjectCount, physicsBeforeBoard.stageObjects);
  assert.deepEqual({ phase: boardSnapshot.state.phase, scores: boardSnapshot.state.scores, puck: boardSnapshot.state.puck, players: boardSnapshot.state.players, settings: boardSnapshot.state.activeMatchSettings, stageObjects: boardSnapshot.renderer.stage.meaningfulObjectCount }, physicsBeforeBoard);
  const boardPngB = await page.evaluate(async () => { const canvas = new OffscreenCanvas(1080, 2400); const context = canvas.getContext("2d")!; context.fillStyle = "#2d1937"; context.fillRect(0, 0, 1080, 2400); context.fillStyle = "#ffd45c"; context.fillRect(0, 1188, 1080, 24); const blob = await canvas.convertToBlob({ type: "image/png" }); return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))); });
  await page.locator("#board-file").setInputFiles({ name: "r3-custom-board-b.png", mimeType: "image/png", buffer: Buffer.from(boardPngB, "base64") });
  await page.waitForFunction(() => [...document.querySelectorAll("[data-board-status]")].some((element) => element.textContent?.includes("r3-custom-board-b.png")));
  const secondBoardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.deepEqual({ phase: secondBoardSnapshot.state.phase, scores: secondBoardSnapshot.state.scores, puck: secondBoardSnapshot.state.puck, players: secondBoardSnapshot.state.players, settings: secondBoardSnapshot.state.activeMatchSettings, stageObjects: secondBoardSnapshot.renderer.stage.meaningfulObjectCount, goals: secondBoardSnapshot.goals, viewport: secondBoardSnapshot.renderer.viewport }, { phase: boardSnapshot.state.phase, scores: boardSnapshot.state.scores, puck: boardSnapshot.state.puck, players: boardSnapshot.state.players, settings: boardSnapshot.state.activeMatchSettings, stageObjects: boardSnapshot.renderer.stage.meaningfulObjectCount, goals: boardSnapshot.goals, viewport: boardSnapshot.renderer.viewport });
  const wrongPng = await page.evaluate(async () => { const canvas = new OffscreenCanvas(100, 100); const context = canvas.getContext("2d")!; context.fillStyle = "#123456"; context.fillRect(0, 0, 100, 100); const blob = await canvas.convertToBlob({ type: "image/png" }); return btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))); });
  await page.locator("#board-file").setInputFiles({ name: "wrong-size.png", mimeType: "image/png", buffer: Buffer.from(wrongPng, "base64") });
  await page.waitForFunction(() => [...document.querySelectorAll("[data-board-status]")].some((element) => element.textContent?.includes("received 100 × 100")));
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "custom");
  await page.locator("#board-file").setInputFiles({ name: "corrupt.png", mimeType: "image/png", buffer: Buffer.from("not-a-png") });
  await page.waitForFunction(() => [...document.querySelectorAll("[data-board-status]")].some((element) => element.textContent?.includes("could not be decoded")));
  assert.equal(await page.locator("#game-shell").getAttribute("data-board"), "custom");
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state != null);
  await page.waitForFunction(() => ((window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state?.tick ?? 0) > 0);
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "custom");
  boardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(boardSnapshot.board.mode, "custom");
  assert.equal(await page.evaluate(async () => { const db = await new Promise<IDBDatabase>((resolvePromise, reject) => { const request = indexedDB.open("cat-paw-air-hockey-theme-v1", 1); request.onsuccess = () => resolvePromise(request.result); request.onerror = () => reject(request.error); }); const present = await new Promise<boolean>((resolvePromise, reject) => { const request = db.transaction("themes").objectStore("themes").get("board-r2"); request.onsuccess = () => resolvePromise(request.result !== undefined); request.onerror = () => reject(request.error); }); db.close(); return present; }), true, "launch and R3 save retain the legacy Board Blob");
  await page.locator("[data-action='menu']").click();
  await page.locator(".settings-view--bottom [data-menu-action='reset-board']").click();
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "default");
  boardSnapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(boardSnapshot.board.mode, "default");
  assert.ok(boardSnapshot.board.disposedOwnedTextureCount >= 1);
  assert.equal(await page.locator("#game-shell").getAttribute("data-legacy-board"), "true");
  await page.locator("[data-menu-action='close']").last().click();
  await page.waitForFunction(() => (document.querySelector("#settings-overlay") as HTMLElement).hidden);
  await page.locator("[data-action='pause']").last().click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "ready");
  await page.locator("[data-action='fullscreen']").tap();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  assert.equal(await page.locator("[data-action='fullscreen']").getAttribute("aria-pressed"), "true");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 412, height: 1000, deviceScaleFactor: 2, mobile: true });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.renderer?.viewport?.presentedHeight === 1000);
  const resizedCanvas = await page.locator("#pixi-host canvas").boundingBox();
  assert.ok(resizedCanvas);
  await page.locator("#pixi-host").dispatchEvent("pointerdown", { pointerId: 909, pointerType: "touch", isPrimary: true, clientX: resizedCanvas.x + resizedCanvas.width / 2, clientY: resizedCanvas.y + resizedCanvas.height * 0.75, bubbles: true, cancelable: true });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.input?.owners?.[1] === 909);
  const mappedAfterFullscreenResize = await page.evaluate(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).input.targets[1]);
  assert.ok(Math.abs(mappedAfterFullscreenResize.x - 270) < 0.01 && Math.abs(mappedAfterFullscreenResize.y - 900) < 0.01, "input consumes the resized canvas transform");
  await page.locator("#pixi-host").dispatchEvent("pointerup", { pointerId: 909, pointerType: "touch", isPrimary: true, clientX: resizedCanvas.x + resizedCanvas.width / 2, clientY: resizedCanvas.y + resizedCanvas.height * 0.75, bubbles: true, cancelable: true });
  await page.locator("[data-action='fullscreen']").tap();
  await page.waitForFunction(() => document.fullscreenElement === null);
  assert.equal(await page.locator("[data-action='fullscreen']").getAttribute("aria-pressed"), "false");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 412, height: 915, deviceScaleFactor: 2, mobile: true });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.renderer?.viewport?.presentedHeight === 915);

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
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "playing", undefined, { timeout: 5_000 });
  await page.screenshot({ path: resolve(screenshotDirectory, "02-active-edge-to-edge.png") });
  await dispatchPointer("pointermove", 111, 0.93);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.players[1].position.y > 1_050);
  await page.screenshot({ path: resolve(screenshotDirectory, "03-player-1-deep-defense.png") });
  await dispatchPointer("pointermove", 222, 0.07);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.players[2].position.y < 150);
  await page.screenshot({ path: resolve(screenshotDirectory, "04-player-2-deep-defense.png") });
  await page.screenshot({ path: resolve(screenshotDirectory, "06-goals-75-125.png") });
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
  assert.equal(snapshot.physics.backend, "rapier2d");
  assert.equal(snapshot.physics.bodyCount, 13);
  assert.ok(snapshot.physics.steps > 0);
  assert.ok(snapshot.physics.timingMilliseconds.p95 < 4, `Rapier p95 ${snapshot.physics.timingMilliseconds.p95} ms`);
  assert.ok(snapshot.physics.timingMilliseconds.worst < 16.67, `Rapier worst ${snapshot.physics.timingMilliseconds.worst} ms`);

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  assert.equal(requests.length, 3);
  assert.ok(requests.every((request) => request === "/"));
  await context.close();
  const offlineRequests: string[] = [];
  const offlineErrors: string[] = [];
  const offlineContext = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, serviceWorkers: "block" });
  const offlinePage = await offlineContext.newPage();
  offlinePage.on("request", (request) => offlineRequests.push(request.url()));
  offlinePage.on("pageerror", (error) => offlineErrors.push(error.message));
  offlinePage.on("console", (message) => { if (message.type() === "error") offlineErrors.push(message.text()); });
  await offlinePage.goto(pathToFileURL(artifactPath).href, { waitUntil: "load" });
  await offlinePage.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.physics?.backend === "rapier2d");
  await offlinePage.waitForFunction(() => ((window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state?.tick ?? 0) > 0);
  const offlineSnapshot = await offlinePage.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(offlineSnapshot.physics.backend, "rapier2d");
  assert.equal(offlineSnapshot.renderer.renderer, "PIXI");
  assert.deepEqual(offlineErrors, []);
  assert.equal(offlineRequests.length, 1);
  assert.ok(offlineRequests[0]?.startsWith("file:"));
  await offlineContext.close();
  const offline = { valid: true, requests: offlineRequests, errors: offlineErrors, backend: offlineSnapshot.physics.backend };
  const report = { schema: "cat-air-hockey.canonical-browser@1", valid: true, artifact: { path: "dist/index.html", bytes: bytes.byteLength, sha256 }, browser: await browser.version(), canvasCount: 1, requests, pageErrors, consoleErrors, offline, snapshot };
  if (process.env.SFHS_BROWSER_REPORT !== undefined) {
    const reportPath = resolve(process.env.SFHS_BROWSER_REPORT);
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise<void>((resolvePromise, reject) => server.close((error) => error === undefined ? resolvePromise() : reject(error)));
}
