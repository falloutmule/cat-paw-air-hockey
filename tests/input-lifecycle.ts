import assert from "node:assert/strict";
import { createHockeyInput } from "../src/input.ts";

class MockPointerEvent extends Event {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly button: number;
  readonly clientX: number;
  readonly clientY: number;
  constructor(type: string, options: { pointerId: number; clientX: number; clientY: number; pointerType?: string; button?: number }) {
    super(type, { cancelable: true });
    this.pointerId = options.pointerId;
    this.pointerType = options.pointerType ?? "touch";
    this.button = options.button ?? 0;
    this.clientX = options.clientX;
    this.clientY = options.clientY;
  }
}

class MockSurface extends EventTarget {
  readonly captures = new Set<number>();
  throwOnCapture = false;
  setPointerCapture(pointerId: number): void {
    if (this.throwOnCapture) throw new Error("capture unavailable");
    this.captures.add(pointerId);
  }
  hasPointerCapture(pointerId: number): boolean { return this.captures.has(pointerId); }
  releasePointerCapture(pointerId: number): void { this.captures.delete(pointerId); }
}

class MockCanvas {
  bounds = { left: 0, top: 0, right: 540, bottom: 960, width: 540, height: 960 };
  getBoundingClientRect(): DOMRect { return this.bounds as DOMRect; }
}

const windowTarget = new EventTarget() as EventTarget & { addEventListener: typeof EventTarget.prototype.addEventListener; removeEventListener: typeof EventTarget.prototype.removeEventListener };
const documentTarget = new EventTarget() as EventTarget & { hidden: boolean; addEventListener: typeof EventTarget.prototype.addEventListener; removeEventListener: typeof EventTarget.prototype.removeEventListener };
documentTarget.hidden = false;
Object.defineProperty(globalThis, "window", { value: windowTarget, configurable: true });
Object.defineProperty(globalThis, "document", { value: documentTarget, configurable: true });

function pointer(surface: MockSurface, type: string, pointerId: number, x: number, y: number): MockPointerEvent {
  const event = new MockPointerEvent(type, { pointerId, clientX: x, clientY: y });
  surface.dispatchEvent(event);
  return event;
}

const results: Array<{ name: string; pass: boolean; details?: string }> = [];
function scenario(name: string, run: () => void): void {
  try { run(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, details: error instanceof Error ? error.stack : String(error) }); }
}

const canvas = new MockCanvas();
let surface = new MockSurface();
let gestures = 0;
const input = createHockeyInput({
  initialSurface: surface as unknown as HTMLElement,
  getCanvas: () => canvas as unknown as HTMLCanvasElement,
  onIntentionalGesture: () => { gestures += 1; }
});

scenario("both players acquire independent pointer IDs simultaneously", () => {
  pointer(surface, "pointerdown", 11, 270, 800);
  pointer(surface, "pointerdown", 22, 270, 160);
  const diagnostics = input.getDiagnostics();
  assert.deepEqual(diagnostics.owners, { 1: 11, 2: 22 });
  assert.deepEqual(diagnostics.held, { 1: true, 2: true });
  assert.equal(gestures, 2);
});

scenario("pointer moves remain mapped to the owning player", () => {
  pointer(surface, "pointermove", 11, 430, 710);
  pointer(surface, "pointermove", 22, 100, 240);
  const snapshot = input.sampleForStep();
  assert.deepEqual(snapshot.players[1].target, { x: 430, y: 710 });
  assert.deepEqual(snapshot.players[2].target, { x: 100, y: 240 });
});

scenario("third pointer does not steal either striker", () => {
  pointer(surface, "pointerdown", 33, 400, 820);
  assert.deepEqual(input.getDiagnostics().owners, { 1: 11, 2: 22 });
  assert.equal(input.getDiagnostics().ignoredPointerCount, 1);
});

scenario("additional same-half pointer is rejected without replacing its owner", () => {
  pointer(surface, "pointerdown", 34, 180, 760);
  assert.deepEqual(input.getDiagnostics().owners, { 1: 11, 2: 22 });
  assert.equal(input.getDiagnostics().ignoredPointerCount, 2);
});

scenario("releasing player one does not interrupt player two", () => {
  pointer(surface, "pointerup", 11, 430, 710);
  const snapshot = input.sampleForStep();
  assert.equal(snapshot.players[1].released, true);
  assert.equal(snapshot.players[1].held, false);
  assert.equal(snapshot.players[2].held, true);
  assert.deepEqual(input.getDiagnostics().owners, { 1: null, 2: 22 });
});

scenario("stale moves after release cannot reacquire a striker", () => {
  pointer(surface, "pointermove", 11, 180, 760);
  const snapshot = input.sampleForStep();
  assert.equal(snapshot.players[1].held, false);
  assert.equal(input.getDiagnostics().owners[1], null);
  assert.equal(input.getDiagnostics().owners[2], 22);
});

scenario("pointer cancellation clears only its owner", () => {
  pointer(surface, "pointercancel", 22, 100, 240);
  const snapshot = input.sampleForStep();
  assert.equal(snapshot.players[2].cancelled, true);
  assert.deepEqual(input.getDiagnostics().owners, { 1: null, 2: null });
});

scenario("lost pointer capture cannot leave a stuck striker", () => {
  pointer(surface, "pointerdown", 44, 250, 760);
  pointer(surface, "lostpointercapture", 44, 250, 760);
  const snapshot = input.sampleForStep();
  assert.equal(snapshot.players[1].cancelled, true);
  assert.equal(snapshot.players[1].held, false);
});

scenario("capture failure is recoverable and keeps semantic ownership", () => {
  surface.throwOnCapture = true;
  pointer(surface, "pointerdown", 55, 250, 760);
  assert.equal(input.getDiagnostics().owners[1], 55);
  assert.equal(input.getDiagnostics().captureFailureCount, 1);
  pointer(surface, "pointerup", 55, 250, 760);
  surface.throwOnCapture = false;
});

scenario("window blur and visibility loss clear held input", () => {
  pointer(surface, "pointerdown", 66, 240, 780);
  pointer(surface, "pointerdown", 77, 240, 180);
  windowTarget.dispatchEvent(new Event("blur"));
  assert.deepEqual(input.getDiagnostics().owners, { 1: null, 2: null });
  pointer(surface, "pointerdown", 88, 240, 780);
  documentTarget.hidden = true;
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  documentTarget.hidden = false;
  assert.deepEqual(input.getDiagnostics().owners, { 1: null, 2: null });
});

scenario("mapping uses current canvas bounds after resize", () => {
  canvas.bounds = { left: 10, top: 20, right: 280, bottom: 500, width: 270, height: 480 };
  pointer(surface, "pointerdown", 99, 145, 420);
  const snapshot = input.sampleForStep();
  assert.ok(Math.abs((snapshot.players[1].target?.x ?? 0) - 270) < 0.001);
  assert.ok(Math.abs((snapshot.players[1].target?.y ?? 0) - 800) < 0.001);
  pointer(surface, "pointerup", 99, 145, 420);
});

scenario("surface rebinding removes old listeners and preserves new listeners", () => {
  const oldSurface = surface;
  const nextSurface = new MockSurface();
  surface = nextSurface;
  input.setSurface(nextSurface as unknown as HTMLElement, () => canvas as unknown as HTMLCanvasElement);
  pointer(oldSurface, "pointerdown", 101, 145, 420);
  assert.deepEqual(input.getDiagnostics().owners, { 1: null, 2: null });
  pointer(nextSurface, "pointerdown", 102, 145, 420);
  assert.equal(input.getDiagnostics().owners[1], 102);
  pointer(nextSurface, "pointerup", 102, 145, 420);
});

scenario("destroy removes listeners and clears ownership", () => {
  input.destroy();
  pointer(surface, "pointerdown", 120, 145, 420);
  assert.deepEqual(input.getDiagnostics().owners, { 1: null, 2: null });
});

const failed = results.filter((result) => !result.pass);
console.log(JSON.stringify({ schema: "cat-air-hockey.input-lifecycle@1", total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length > 0) process.exitCode = 1;
