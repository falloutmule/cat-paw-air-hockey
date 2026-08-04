import assert from "node:assert/strict";
import { createHockeyAudioController } from "../src/audio.ts";
import type { PresentationEvent } from "../src/state.ts";

class MockAudioParam {
  value = 0;
  setValueAtTime(value: number): void { this.value = value; }
  exponentialRampToValueAtTime(value: number): void { this.value = value; }
  cancelScheduledValues(): void {}
  setTargetAtTime(value: number): void { this.value = value; }
}

class MockNode extends EventTarget {
  connect<T>(target: T): T { return target; }
  disconnect(): void {}
}

let toneStarts = 0;
let contextsCreated = 0;

class MockGain extends MockNode { gain = new MockAudioParam(); }
class MockOscillator extends MockNode {
  type: OscillatorType = "sine";
  frequency = new MockAudioParam();
  detune = new MockAudioParam();
  start(): void { toneStarts += 1; }
  stop(): void {}
}
class MockBufferSource extends MockNode {
  buffer: AudioBuffer | null = null;
  start(): void { toneStarts += 1; }
  stop(): void {}
}
class MockFilter extends MockNode { type: BiquadFilterType = "highpass"; frequency = new MockAudioParam(); }
class MockAudioContext {
  state: AudioContextState = "suspended";
  currentTime = 0;
  sampleRate = 44_100;
  destination = new MockNode();
  constructor() { contextsCreated += 1; }
  createGain(): GainNode { return new MockGain() as unknown as GainNode; }
  createOscillator(): OscillatorNode { return new MockOscillator() as unknown as OscillatorNode; }
  createBufferSource(): AudioBufferSourceNode { return new MockBufferSource() as unknown as AudioBufferSourceNode; }
  createBiquadFilter(): BiquadFilterNode { return new MockFilter() as unknown as BiquadFilterNode; }
  createBuffer(_channels: number, _frames: number, _rate: number): AudioBuffer {
    return { getChannelData: () => new Float32Array(64) } as unknown as AudioBuffer;
  }
  async resume(): Promise<void> { this.state = "running"; }
  async close(): Promise<void> { this.state = "closed"; }
}

const results: Array<{ name: string; pass: boolean; details?: string }> = [];
async function scenario(name: string, run: () => Promise<void> | void): Promise<void> {
  try { await run(); results.push({ name, pass: true }); }
  catch (error) { results.push({ name, pass: false, details: error instanceof Error ? error.stack : String(error) }); }
}

const originalWindow = globalThis.window;
function installWindow(value: Record<string, unknown>): void {
  Object.defineProperty(globalThis, "window", { configurable: true, writable: true, value });
}

try {
  await scenario("starts locked before an intentional unlock", () => {
    installWindow({ AudioContext: MockAudioContext });
    assert.equal(createHockeyAudioController().getStatus(), "locked");
  });

  await scenario("reports unavailable when Web Audio is absent", async () => {
    installWindow({});
    const audio = createHockeyAudioController();
    await audio.unlock();
    assert.equal(audio.getStatus(), "unavailable");
  });

  await scenario("intentional unlock creates and resumes one context", async () => {
    contextsCreated = 0;
    installWindow({ AudioContext: MockAudioContext });
    const audio = createHockeyAudioController();
    await audio.unlock();
    await audio.unlock();
    assert.equal(contextsCreated, 1);
    assert.equal(audio.getStatus(), "ready");
  });

  await scenario("mute and unmute preserve a ready unlocked controller", async () => {
    installWindow({ AudioContext: MockAudioContext });
    const audio = createHockeyAudioController();
    await audio.unlock();
    assert.equal(audio.toggleMuted(), true);
    assert.equal(audio.getStatus(), "muted");
    assert.equal(audio.toggleMuted(), false);
    assert.equal(audio.getStatus(), "ready");
  });

  await scenario("presentation events are consumed exactly once by event ID", async () => {
    toneStarts = 0;
    installWindow({ AudioContext: MockAudioContext });
    const audio = createHockeyAudioController();
    await audio.unlock();
    toneStarts = 0;
    const event = { id: 9, kind: "ready", player: 1, strength: 1 } as unknown as PresentationEvent;
    audio.consume([event, event]);
    assert.equal(toneStarts, 1);
  });

  await scenario("dispose closes the controller and makes later unlock inert", async () => {
    installWindow({ AudioContext: MockAudioContext });
    const audio = createHockeyAudioController();
    await audio.unlock();
    await audio.dispose();
    await audio.unlock();
    assert.equal(audio.getStatus(), "closed");
  });
} finally {
  Object.defineProperty(globalThis, "window", { configurable: true, writable: true, value: originalWindow });
}

const failed = results.filter((result) => !result.pass);
console.log(JSON.stringify({ schema: "cat-air-hockey.audio-lifecycle@1", total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
if (failed.length > 0) process.exitCode = 1;
