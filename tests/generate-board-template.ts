import assert from "node:assert/strict";
import { realpathSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const playwrightResolver = process.env.SFHS_PLAYWRIGHT_RESOLVER ?? resolve(process.cwd(), "node_modules", "@sfhs", "browser-runner", "package.json");
const { chromium } = createRequire(realpathSync(playwrightResolver))("playwright") as { readonly chromium: { launch(options: { readonly headless: boolean }): Promise<any> } };
const artifactPath = resolve(process.env.CAT_PAW_ARTIFACT ?? "dist/index.html");
const outputPath = resolve(process.env.CAT_PAW_BOARD_TEMPLATE ?? "art/theme/cat-paw-board-template.png");
const artifact = await readFile(artifactPath);
const server = createServer((_request, response) => { response.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": artifact.byteLength }); response.end(artifact); });
await new Promise<void>((resolvePromise) => server.listen(0, "127.0.0.1", resolvePromise));
const address = server.address();
if (address === null || typeof address === "string") throw new Error("Unable to serve Board template source.");
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${address.port}/?board-template-source=1`, { waitUntil: "load" });
  await page.waitForFunction(() => (window.__CAT_AIR_HOCKEY__?.snapshot() as { state?: unknown } | undefined)?.state != null);
  await page.locator("[data-action='menu']").click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator(".settings-view--bottom [data-menu-action='board-template']").click();
  const download = await downloadPromise;
  await mkdir(dirname(outputPath), { recursive: true });
  await download.saveAs(outputPath);
  await context.close();
} finally {
  await browser.close();
  await new Promise<void>((resolvePromise, reject) => server.close((error) => error === undefined ? resolvePromise() : reject(error)));
}
const png = await readFile(outputPath);
assert.equal(png.readUInt32BE(16), 1080);
assert.equal(png.readUInt32BE(20), 1920);
console.log(JSON.stringify({ schema: "cat-air-hockey.board-template@1", path: outputPath, width: 1080, height: 1920, bytes: png.byteLength, method: "packed-game Board template download" }, null, 2));
