import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const json = async (path: string): Promise<any> => JSON.parse(await readFile(new URL(path, root), "utf8"));
const bytes = async (path: string): Promise<Buffer> => readFile(new URL(path, root));
const sha256 = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const pngDimensions = (value: Buffer): { width: number; height: number } => ({ width: value.readUInt32BE(16), height: value.readUInt32BE(20) });

const expected = Object.freeze({
  "art/gameplay-actors/cat-paw-player1.png": Object.freeze({ bytes: 8813, sha256: "2f350bdd7b8207f8ad9eadc774d87fd6ea8917a7974d83b50dc2b4688d9c7b09", width: 896, height: 448 }),
  "art/gameplay-actors/cat-paw-player2.png": Object.freeze({ bytes: 8814, sha256: "d6946cecf84386a6db9b7ab3c34a1bd56930217a239100e3cc8b7938c6595a43", width: 896, height: 448 }),
  "art/gameplay-actors/cat-paw-puck-neutral.png": Object.freeze({ bytes: 4129, sha256: "db55b954f2a01dfc23c55f5b43bf0efe9ef4af25c583b20253c866f0f4e5bfbf", width: 512, height: 256 }),
  "art/gameplay-actors/cat-paw-puck-player1.png": Object.freeze({ bytes: 4150, sha256: "41acc3fee7711d6735d84347689f0de74fedad5698b19da9c4e593cb17633fc1", width: 512, height: 256 }),
  "art/gameplay-actors/cat-paw-puck-player2.png": Object.freeze({ bytes: 4151, sha256: "f3b35382326a841d7df0eaa18ea5c88c2a097a8f9fcf9a4d381d8dda708779d9", width: 512, height: 256 })
});

for (const [path, identity] of Object.entries(expected)) {
  const value = await bytes(path);
  assert.equal(value.length, identity.bytes, `${path} byte identity`);
  assert.equal(sha256(value), identity.sha256, `${path} hash identity`);
  assert.deepEqual(pngDimensions(value), { width: identity.width, height: identity.height }, `${path} sheet geometry`);
  assert.equal(value.subarray(1, 4).toString("ascii"), "PNG");
}

const pawMetadata = await json("art/gameplay-actors/cat-paw-export-metadata.json");
const puckMetadata = await json("art/gameplay-actors/cat-paw-puck-export-metadata.json");
for (const [metadata, dimensions, variants] of [[pawMetadata, { width: 112, height: 112 }, 2], [puckMetadata, { width: 64, height: 64 }, 3]] as const) {
  assert.equal(metadata.schema, "sfhs.godot-animation-export-metadata@1");
  assert.equal(metadata.godot.version, "4.7.1.stable.official.a13da4feb");
  assert.equal(metadata.godot.executableSha256, "35dab11e04ece16a2b93035e65204f4a944a3e00b020d43e54409193379d5eef");
  assert.deepEqual(metadata.workingFrame, { height: dimensions.height, width: dimensions.width });
  assert.deepEqual(metadata.sheet, { columns: 4, rows: 2 });
  assert.deepEqual(metadata.samples.map((sample: any) => sample.id), ["idle", "contact-0", "contact-1", "contact-2", "contact-3", "contact-4", "contact-5", "contact-6"]);
  assert.equal(metadata.outputs.length, variants);
}

for (const path of ["art/gameplay-actors/cat-paw-export-validation.json", "art/gameplay-actors/cat-paw-puck-export-validation.json"]) {
  const validation = await json(path);
  assert.equal(validation.valid, true);
  assert.ok(validation.checks.includes("variant-alpha-parity"));
  const referenceAlpha = validation.outputs[0].frames.map((frame: any) => frame.alphaSha256);
  for (const output of validation.outputs) {
    assert.deepEqual(output.frames.map((frame: any) => frame.alphaSha256), referenceAlpha, `${path} palette variants share silhouettes`);
    assert.equal(new Set(output.frames.map((frame: any) => frame.rgbaSha256)).size, 8, `${output.id} has eight distinct frames`);
  }
}

console.log(JSON.stringify({ schema: "cat-paw.gameplay-actor-animation-tests@1", passed: true, cases: 31 }, null, 2));
