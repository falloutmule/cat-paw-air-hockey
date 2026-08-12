import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const playwrightResolver = process.env.SFHS_PLAYWRIGHT_RESOLVER
  ?? resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json");
const { chromium } = createRequire(realpathSync(playwrightResolver))("playwright") as {
  readonly chromium: { launch(options: { readonly headless: boolean }): Promise<any> };
};

const artifact = await readFile(resolve(process.cwd(), "dist", "index.html"));
const requests: string[] = [];
const errors: string[] = [];
const server = createServer((request, response) => {
  requests.push(request.url ?? "");
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": artifact.byteLength });
  response.end(artifact);
});

await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const address = server.address();
if (address === null || typeof address === "string") throw new Error("Unable to start CI browser server.");
const url = `http://127.0.0.1:${address.port}/`;
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  page.on("pageerror", (error: Error) => errors.push(error.message));
  page.on("console", (message: { type(): string; text(): string }) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(url, { waitUntil: "load", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const snapshot = window.__CAT_AIR_HOCKEY__?.snapshot() as any;
      return snapshot?.physics?.backend === "rapier2d" && snapshot?.state?.tick > 0;
    },
    undefined,
    { timeout: 15_000 }
  );
  const snapshot = await page.evaluate(() => window.__CAT_AIR_HOCKEY__!.snapshot() as any);
  assert.equal(snapshot.state.phase, "ready");
  assert.equal(snapshot.physics.backend, "rapier2d");
  assert.equal(snapshot.renderer.renderer, "PIXI");
  assert.equal(await page.locator("canvas").count(), 1);
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, ["/"]);
  await context.close();
  console.log(JSON.stringify({ valid: true, backend: snapshot.physics.backend, phase: snapshot.state.phase, requests }));
} finally {
  await browser.close();
  await new Promise<void>((done, reject) => server.close((error) => error === undefined ? done() : reject(error)));
}
