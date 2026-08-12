import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const playwrightResolver = process.env.SFHS_PLAYWRIGHT_RESOLVER
  ?? resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json");
const { chromium } = createRequire(realpathSync(playwrightResolver))("playwright") as {
  readonly chromium: { launch(options: { readonly headless: boolean }): Promise<any> };
};

const artifactPath = resolve(process.env.CAT_PAW_ARTIFACT ?? resolve(process.cwd(), "dist", "index.html"));
const artifact = await readFile(artifactPath);
const artifactSha256 = createHash("sha256").update(artifact).digest("hex");
const evidenceDirectory = resolve(process.env.CAT_PAW_SEMANTIC_DIR ?? "test-results/CATPAW-EXPANSION-001-R3/semantic-browser");
await mkdir(evidenceDirectory, { recursive: true });
const requests: string[] = [];
const pageErrors: string[] = [];
const consoleErrors: string[] = [];

const server = createServer((request, response) => {
  requests.push(request.url ?? "");
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": artifact.byteLength });
  response.end(artifact);
});
await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", resolvePromise));
const address = server.address();
if (address === null || typeof address === "string") throw new Error("Unable to allocate semantic browser server.");
const url = `http://127.0.0.1:${address.port}/`;

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, acceptDownloads: true });
  await context.route("**/*", async (route) => {
    const requestUrl = route.request().url();
    if (requestUrl === url || /^(?:about:blank|blob:|data:)/u.test(requestUrl)) await route.continue();
    else { pageErrors.push(`Unexpected runtime request: ${requestUrl}`); await route.abort(); }
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => ((window.__CAT_AIR_HOCKEY__?.snapshot() as any)?.state?.tick ?? 0) > 0);

  const snapshot = async (): Promise<any> => page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot());
  assert.deepEqual((await snapshot()).viewport, {
    logicalWidth: 540, logicalHeight: 1200, presentedWidth: 412, presentedHeight: 915,
    backingWidth: 1080, backingHeight: 2400, resolution: 2,
    scaleX: 0.7625, scaleY: 0.7625, offsetX: 0.125, offsetY: 0, orientation: "portrait"
  });

  const touch = async (type: string, pointerId: number, logicalX: number, logicalY: number): Promise<void> => {
    const bounds = await page.locator("#pixi-host canvas").boundingBox();
    assert.ok(bounds);
    await page.locator("#pixi-host").dispatchEvent(type, {
      pointerId, pointerType: "touch", isPrimary: pointerId === 1,
      clientX: bounds.x + logicalX / 540 * bounds.width,
      clientY: bounds.y + logicalY / 1200 * bounds.height,
      bubbles: true, cancelable: true
    });
  };
  const setRange = async (setting: string, value: number): Promise<void> => {
    await page.locator(`.settings-view--bottom input[data-setting='${setting}']`).evaluate((input, next) => {
      (input as HTMLInputElement).value = String(next);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
  };

  await page.locator("[data-action='menu']").click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
  await setRange("puckSpeed", 130);
  await setRange("pawSpeed1", 130);
  await setRange("returnSpeed1", 125);
  await setRange("goalSize2", 200);
  await page.locator(".settings-view--bottom [data-menu-action='close']").click();
  await page.locator("[data-action='pause']").click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "ready");

  await touch("pointerdown", 1, 270, 1028);
  await touch("pointerdown", 2, 270, 172);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "countdown", undefined, { timeout: 3_000 });
  await touch("pointermove", 1, 270, 800);
  await touch("pointermove", 2, 100, 100);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "playing", undefined, { timeout: 5_000 });
  await touch("pointermove", 1, 270, 1100);
  await touch("pointermove", 2, 100, 100);
  await page.waitForFunction(() => { const state = (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state; return state.players[1].position.y > 1_050 && state.players[2].position.x < 150 && state.players[2].position.y < 150; });

  let observedContact = false;
  let observedContactPalette: string | undefined;
  let observedContactDeformation = false;
  const scoreForPlayerOne = async (targetScore: number): Promise<void> => {
    const deadline = Date.now() + 90_000;
    let sweptThisDescent = false;
    let topSweepComplete = false;
    let serveSweepPending = true;
    while (Date.now() < deadline) {
      const current = await snapshot();
      if (current.puckPresentation?.contactPlayer != null) {
        observedContact = true;
        observedContactDeformation ||= Math.abs(current.puckPresentation.renderedScaleX - current.puckPresentation.renderedScaleY) > 0.01;
      }
      if (current.state.puck.lastHitter === 1 && current.puckPresentation?.palette === "player1") observedContactPalette = "player1";
      if (current.state.puck.lastHitter === 2 && current.puckPresentation?.palette === "player2") observedContactPalette = "player2";
      if (current.state.scores[1] >= targetScore) return;
      if (current.state.phase === "countdown") {
        await touch("pointermove", 1, 270, 800);
        await touch("pointermove", 2, 100, 100);
        serveSweepPending = true;
        await page.waitForTimeout(45);
        continue;
      }
      if (current.state.phase === "playing") {
        if (serveSweepPending) {
          await touch("pointermove", 1, 270, 660);
          await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).puckPresentation?.contactPlayer != null, undefined, { timeout: 500 }).catch(() => undefined);
          const contact = await snapshot();
          if (contact.puckPresentation?.contactPlayer != null) {
            observedContact = true;
            observedContactDeformation ||= Math.abs(contact.puckPresentation.renderedScaleX - contact.puckPresentation.renderedScaleY) > 0.01;
          }
          if (contact.state.puck.lastHitter === 1 && contact.puckPresentation?.palette === "player1") observedContactPalette = "player1";
          if (contact.state.puck.lastHitter === 2 && contact.puckPresentation?.palette === "player2") observedContactPalette = "player2";
          serveSweepPending = false;
          continue;
        }
        const puck = current.state.puck.position as { x: number; y: number };
        const velocity = current.state.puck.velocity as { x: number; y: number };
        const player1Radius = 45 * current.state.activeMatchSettings.pawSize[1] / 100;
        const player2Radius = 45 * current.state.activeMatchSettings.pawSize[2] / 100;
        const x = Math.max(player1Radius, Math.min(540 - player1Radius, puck.x));
        const player2X = Math.max(player2Radius, Math.min(540 - player2Radius, puck.x));
        if (puck.y > 650 && Math.hypot(velocity.x, velocity.y) < 24) {
          await touch("pointermove", 1, x, Math.min(1_100, puck.y + 105));
          await page.waitForTimeout(220);
          await touch("pointermove", 1, x, 660);
          await page.waitForTimeout(320);
          sweptThisDescent = true;
          continue;
        }
        if (puck.y >= 600 && puck.y <= 650 && Math.hypot(velocity.x, velocity.y) < 24) {
          const sweepX = x < 270 ? Math.min(540 - player1Radius, x + 120) : Math.max(player1Radius, x - 120);
          await touch("pointermove", 1, sweepX, 700);
          await page.waitForTimeout(120);
          await touch("pointermove", 1, x, 660);
          await page.waitForTimeout(220);
          continue;
        }
        if (puck.y > 620) topSweepComplete = false;
        if (puck.y < 620 && Math.hypot(velocity.x, velocity.y) < 18) topSweepComplete = false;
        if (puck.y < 620 && !topSweepComplete) {
          const desiredY = Math.min(540, puck.y + 78);
          const player2 = current.state.players[2].position as { x: number; y: number };
          await touch("pointermove", 2, player2X, desiredY);
          if (Math.hypot(player2.x - player2X, player2.y - desiredY) < 52) {
            await touch("pointermove", 2, 270, 94);
            topSweepComplete = true;
            await page.waitForTimeout(180);
          } else {
            await page.waitForTimeout(35);
          }
          continue;
        }
        if (velocity.y > 12 && puck.y >= 545) {
          if (!sweptThisDescent && puck.y < 730) {
            await touch("pointermove", 1, x, Math.min(1_020, puck.y + 105));
            await page.waitForTimeout(35);
          } else if (!sweptThisDescent) {
            await touch("pointermove", 1, x, 660);
            sweptThisDescent = true;
            await page.waitForTimeout(110);
          } else {
            await touch("pointermove", 1, x, 660);
            await page.waitForTimeout(35);
          }
        } else {
          if (velocity.y < -12) sweptThisDescent = false;
          await touch("pointermove", 1, x, 660);
          await page.waitForTimeout(45);
        }
      } else {
        await page.waitForTimeout(90);
      }
    }
    const current = await snapshot();
    throw new Error(`Normal touch rally did not reach Player 1 score ${targetScore}; ${JSON.stringify({ phase: current.state.phase, scores: current.state.scores, puck: current.state.puck, players: current.state.players, input: current.input, recentEvents: current.state.recentEvents })}`);
  };

  const openingContactSeen = page.waitForFunction(() => {
    const puck = (window.__CAT_AIR_HOCKEY__!.snapshot() as any).puckPresentation;
    return puck?.contactPlayer != null && Math.abs(puck.renderedScaleX - puck.renderedScaleY) > 0.01;
  }, undefined, { timeout: 1_500 });
  await touch("pointermove", 1, 270, 690);
  await openingContactSeen;
  const openingContact = await snapshot();
  observedContact = true;
  observedContactDeformation = true;
  if (openingContact.state.puck.lastHitter === 1 && openingContact.puckPresentation?.palette === "player1") observedContactPalette = "player1";
  if (openingContact.state.puck.lastHitter === 2 && openingContact.puckPresentation?.palette === "player2") observedContactPalette = "player2";

  await scoreForPlayerOne(1);
  assert.equal((await snapshot()).state.scores[1], 1);
  assert.equal(observedContact, true, "normal pointer play reaches the contact presentation lane");
  assert.ok(observedContactPalette === "player1" || observedContactPalette === "player2", "contact gives the puck the last hitter's cat palette");
  assert.equal(observedContactDeformation, true, "normal motion visibly deforms the puck during contact");

  await page.locator("[data-action='menu']").click();
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "paused");
  await setRange("goalSize1", 75);
  await setRange("pawSize1", 125);
  await setRange("returnSpeed1", 70);
  await page.waitForFunction(() => { const state = (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state; return state.pendingMatchSettings.goalSize[1] === 75 && state.pendingMatchSettings.pawSize[1] === 125 && state.pendingMatchSettings.returnSpeed[1] === 70; });
  let paused = await snapshot();
  assert.equal(paused.state.activeMatchSettings.goalSize[1], 200, "mid-match goal resize waits for the next safe boundary");
  assert.equal(paused.state.activeMatchSettings.pawSize[1], 200, "mid-match paw resize waits for the next safe boundary");
  assert.equal(paused.paws.bottom.nominalDiameter, 180, "rendered paw remains at the active size during the paused rally");
  assert.equal(paused.state.activeMatchSettings.returnSpeed[1], 125, "mid-match return handicap waits for the next safe boundary");

  const boardPng = await page.evaluate(async () => {
    const canvas = new OffscreenCanvas(1080, 2400);
    const context2d = canvas.getContext("2d")!;
    context2d.fillStyle = "#203746"; context2d.fillRect(0, 0, 1080, 2400);
    context2d.fillStyle = "#fff4d6"; context2d.fillRect(0, 1194, 1080, 12);
    return btoa(String.fromCharCode(...new Uint8Array(await (await canvas.convertToBlob({ type: "image/png" })).arrayBuffer())));
  });
  await page.locator("#board-file").setInputFiles({ name: "semantic-r3-board.png", mimeType: "image/png", buffer: Buffer.from(boardPng, "base64") });
  await page.waitForFunction(() => document.querySelector("#game-shell")?.getAttribute("data-board") === "custom");
  await page.locator(".settings-view--bottom [data-menu-action='close']").click();

  await page.locator("[data-action='fullscreen']").tap();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  const fullscreenSnapshot = await snapshot();
  assert.equal(fullscreenSnapshot.viewport.logicalWidth, 540);
  assert.equal(fullscreenSnapshot.viewport.logicalHeight, 1200);
  await page.locator("[data-action='fullscreen']").tap();
  await page.waitForFunction(() => document.fullscreenElement === null);

  await touch("pointerdown", 1, 270, 1_050);
  await touch("pointerdown", 2, 100, 100);
  await page.locator("[data-action='pause']").click();
  await scoreForPlayerOne(2);
  await page.waitForFunction(() => { const snapshot = window.__CAT_AIR_HOCKEY__!.snapshot() as any; const state = snapshot.state; return state.phase === "countdown" && state.activeMatchSettings.goalSize[1] === 75 && state.activeMatchSettings.pawSize[1] === 125 && state.activeMatchSettings.returnSpeed[1] === 70 && snapshot.paws.bottom.nominalDiameter === 112.5; }, undefined, { timeout: 3_000 });
  const applied = await snapshot();
  assert.equal(applied.goals.bottom.openingWidth, 138);
  assert.equal(applied.goals.top.openingWidth, 368);
  assert.equal(applied.paws.bottom.nominalDiameter, 112.5);
  await page.screenshot({ path: resolve(evidenceDirectory, "11-paw-size-125-active.png") });

  await scoreForPlayerOne(3);
  assert.equal((await snapshot()).state.scores[1], 3, "another normal rally completes with the 70% return handicap active");
  await scoreForPlayerOne(4);
  await scoreForPlayerOne(5);
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state.phase === "won", undefined, { timeout: 3_000 });
  const won = await snapshot();
  assert.equal(won.state.scores[1], 5);
  assert.ok(won.state.scores[2] < 5);
  assert.equal(won.state.winner, 1);
  assert.equal(await page.locator("[data-action='capture']").isVisible(), true);
  assert.equal(await page.locator("[data-action='pause']").isVisible(), false);
  await page.screenshot({ path: resolve(evidenceDirectory, "10-winner-final-capture-state.png") });

  const downloadPromise = page.waitForEvent("download");
  await page.locator("[data-action='capture']").click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), `cat-paw-5-${won.state.scores[2]}.png`);
  await download.saveAs(resolve(evidenceDirectory, download.suggestedFilename()));

  await touch("pointermove", 1, 270, 1028);
  await touch("pointermove", 2, 270, 172);
  await page.waitForFunction(() => { const state = (window.__CAT_AIR_HOCKEY__!.snapshot() as any).state; return state.phase === "countdown" && state.scores[1] === 0 && state.scores[2] === 0; }, undefined, { timeout: 3_000 });
  const rematch = await snapshot();
  assert.equal(rematch.board.mode, "custom");
  assert.equal(rematch.state.activeMatchSettings.goalSize[1], 75);
  assert.equal(rematch.state.activeMatchSettings.returnSpeed[1], 70);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(requests, ["/"]);
  console.log(JSON.stringify({
    schema: "cat-air-hockey.r3-semantic-browser@1", valid: true,
    artifact: { bytes: artifact.byteLength, sha256: artifactSha256 },
    browser: await browser.version(), scoresBeforeRematch: won.state.scores,
    rematch: { phase: rematch.state.phase, scores: rematch.state.scores },
    contactPresentation: { observedContact, observedContactPalette, observedContactDeformation },
    actions: ["boot", "ready", "play", "paw and puck contact animation", "deep defense", "score", "defer goal resize", "defer return handicap", "load Board", "fullscreen enter/exit", "continue", "first to five", "capture", "rematch"],
    requests, pageErrors, consoleErrors
  }, null, 2));
  await context.close();
} finally {
  await browser.close();
  await new Promise<void>((resolvePromise, reject) => server.close((error) => error === undefined ? resolvePromise() : reject(error)));
}
