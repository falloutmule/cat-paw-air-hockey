import type { PresentationEvent } from "./state.ts";

export type AudioStatus = "locked" | "ready" | "muted" | "unavailable" | "closed";

export interface HockeyAudioController {
  unlock(): Promise<void>;
  consume(events: readonly PresentationEvent[]): void;
  setMuted(muted: boolean): void;
  toggleMuted(): boolean;
  isMuted(): boolean;
  getStatus(): AudioStatus;
  playUi(kind: "mute" | "pause" | "resume"): void;
  dispose(): Promise<void>;
}

export function createHockeyAudioController(): HockeyAudioController {
  let context: AudioContext | undefined;
  let master: GainNode | undefined;
  let muted = false;
  let status: AudioStatus = "locked";
  let disposed = false;
  let lastEventId = 0;
  let unlockConfirmed = false;

  function ensureContext(): AudioContext | undefined {
    if (disposed) return undefined;
    if (context !== undefined) return context;
    const Constructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Constructor === undefined) {
      status = "unavailable";
      return undefined;
    }
    try {
      context = new Constructor();
      master = context.createGain();
      master.gain.value = muted ? 0 : 0.72;
      master.connect(context.destination);
      return context;
    } catch {
      status = "unavailable";
      return undefined;
    }
  }

  function tone(frequency: number, duration: number, volume: number, type: OscillatorType = "sine", detune = 0, delay = 0): void {
    const active = ensureContext();
    if (active === undefined || master === undefined || muted || status === "locked") return;
    const start = active.currentTime + delay;
    const oscillator = active.createOscillator();
    const gain = active.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.value = detune;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    oscillator.addEventListener("ended", () => { oscillator.disconnect(); gain.disconnect(); }, { once: true });
  }

  function noise(duration: number, volume: number, highpass: number, delay = 0): void {
    const active = ensureContext();
    if (active === undefined || master === undefined || muted || status === "locked") return;
    const start = active.currentTime + delay;
    const frames = Math.max(1, Math.ceil(active.sampleRate * duration));
    const buffer = active.createBuffer(1, frames, active.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 0x91e10da5;
    for (let i = 0; i < frames; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = ((seed / 0xffffffff) * 2 - 1) * (1 - i / frames);
    }
    const source = active.createBufferSource();
    const filter = active.createBiquadFilter();
    const gain = active.createGain();
    filter.type = "highpass";
    filter.frequency.value = highpass;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(master);
    source.start(start);
    source.stop(start + duration + 0.01);
    source.addEventListener("ended", () => { source.disconnect(); filter.disconnect(); gain.disconnect(); }, { once: true });
  }

  function pawHit(strength: number): void {
    const normalized = Math.min(1, Math.max(0, strength));
    tone(150 + normalized * 190, 0.055 + normalized * 0.035, 0.06 + normalized * 0.13, "triangle");
    noise(0.025 + normalized * 0.03, 0.025 + normalized * 0.07, 900 + normalized * 1_800);
  }

  function wallHit(strength: number): void {
    const normalized = Math.min(1, Math.max(0, strength));
    tone(210 + normalized * 90, 0.04, 0.025 + normalized * 0.065, "square");
    noise(0.025, 0.02 + normalized * 0.045, 1_600);
  }

  function goal(): void {
    tone(523.25, 0.38, 0.12, "sine");
    tone(659.25, 0.42, 0.1, "sine", 0, 0.07);
    tone(783.99, 0.55, 0.09, "sine", 0, 0.14);
    noise(0.09, 0.035, 2_600, 0.03);
  }

  function win(): void {
    for (const [index, frequency] of [392, 523.25, 659.25, 783.99].entries()) {
      tone(frequency, 0.7, 0.075, "sine", 0, index * 0.065);
    }
    const active = ensureContext();
    if (active === undefined || master === undefined || muted || status === "locked") return;
    const start = active.currentTime + 0.28;
    const carrier = active.createOscillator();
    const modulation = active.createOscillator();
    const modulationGain = active.createGain();
    const gain = active.createGain();
    carrier.type = "sawtooth";
    carrier.frequency.value = 62;
    modulation.type = "sine";
    modulation.frequency.value = 22;
    modulationGain.gain.value = 9;
    modulation.connect(modulationGain).connect(carrier.frequency);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    carrier.connect(gain).connect(master);
    carrier.start(start); modulation.start(start);
    carrier.stop(start + 0.92); modulation.stop(start + 0.92);
    carrier.addEventListener("ended", () => { carrier.disconnect(); modulation.disconnect(); modulationGain.disconnect(); gain.disconnect(); }, { once: true });
  }

  function setMuted(value: boolean): void {
    muted = value;
    if (master !== undefined && context !== undefined) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(muted ? 0 : 0.72, context.currentTime, 0.015);
    }
    if (status !== "unavailable" && status !== "closed" && status !== "locked") status = muted ? "muted" : "ready";
  }

  function playUi(kind: "mute" | "pause" | "resume"): void {
    if (kind === "mute") tone(280, 0.05, 0.035, "square");
    else if (kind === "pause") tone(250, 0.08, 0.045, "triangle");
    else tone(380, 0.08, 0.045, "triangle");
  }

  return {
    async unlock(): Promise<void> {
      const active = ensureContext();
      if (active === undefined || disposed) return;
      try {
        if (active.state !== "running") await active.resume();
        status = muted ? "muted" : "ready";
        if (!unlockConfirmed) {
          unlockConfirmed = true;
          tone(440, 0.045, 0.025, "sine");
        }
      } catch {
        status = "unavailable";
      }
    },
    consume(events): void {
      for (const event of events) {
        if (event.id <= lastEventId) continue;
        lastEventId = event.id;
        if (event.kind === "ready") tone(event.player === 1 ? 620 : 540, 0.08, 0.055, "sine");
        else if (event.kind === "countdown") tone(390 + event.strength * 170, 0.08, 0.065, "square");
        else if (event.kind === "paw-hit") pawHit(event.strength);
        else if (event.kind === "wall-hit") wallHit(event.strength);
        else if (event.kind === "goal") goal();
        else if (event.kind === "win") win();
        else if (event.kind === "pause") playUi("pause");
        else if (event.kind === "resume") playUi("resume");
      }
    },
    setMuted,
    toggleMuted(): boolean {
      setMuted(!muted);
      return muted;
    },
    isMuted: () => muted,
    getStatus: () => status,
    playUi,
    async dispose(): Promise<void> {
      if (disposed) return;
      disposed = true;
      status = "closed";
      if (context !== undefined && context.state !== "closed") await context.close().catch(() => undefined);
      context = undefined;
      master = undefined;
    }
  };
}
