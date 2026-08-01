import type { SfhsSemanticActionSource } from "@sfhs/pixi-runtime";
import {
  type HockeyActionSnapshot,
  type LogicalPoint,
  type PlayerAction,
  type PlayerId
} from "./actions.ts";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./constants.ts";

interface MutablePlayerInput {
  pointerId?: number;
  held: boolean;
  started: boolean;
  released: boolean;
  cancelled: boolean;
  target?: LogicalPoint;
  keys: Set<string>;
}

export interface HockeyInputDiagnostics {
  readonly owners: Readonly<Record<PlayerId, number | null>>;
  readonly held: Readonly<Record<PlayerId, boolean>>;
  readonly ignoredPointerCount: number;
  readonly captureFailureCount: number;
  readonly clearCount: number;
}

export interface HockeyInput extends SfhsSemanticActionSource<HockeyActionSnapshot> {
  requestPause(): void;
  setSurface(surface: HTMLElement, getCanvas: () => HTMLCanvasElement | undefined): void;
  getDiagnostics(): HockeyInputDiagnostics;
}

export function createHockeyInput(options: {
  readonly initialSurface: HTMLElement;
  readonly getCanvas: () => HTMLCanvasElement | undefined;
  readonly onIntentionalGesture?: () => void;
}): HockeyInput {
  const players: Record<PlayerId, MutablePlayerInput> = {
    1: { held: false, started: false, released: false, cancelled: false, keys: new Set() },
    2: { held: false, started: false, released: false, cancelled: false, keys: new Set() }
  };
  let surface = options.initialSurface;
  let getCanvas = options.getCanvas;
  let pausePressed = false;
  let ignoredPointerCount = 0;
  let captureFailureCount = 0;
  let clearCount = 0;
  const surfaceRemovers: Array<() => void> = [];
  const globalRemovers: Array<() => void> = [];

  const keyMap: Readonly<Record<string, readonly [PlayerId, "up" | "down" | "left" | "right"]>> = Object.freeze({
    KeyW: [1, "up"], KeyS: [1, "down"], KeyA: [1, "left"], KeyD: [1, "right"],
    ArrowUp: [2, "up"], ArrowDown: [2, "down"], ArrowLeft: [2, "left"], ArrowRight: [2, "right"]
  });

  function mapPoint(event: PointerEvent): LogicalPoint | undefined {
    const canvas = getCanvas();
    if (canvas === undefined) return undefined;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return undefined;
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      return undefined;
    }
    return Object.freeze({
      x: Math.min(LOGICAL_WIDTH, Math.max(0, (event.clientX - bounds.left) / bounds.width * LOGICAL_WIDTH)),
      y: Math.min(LOGICAL_HEIGHT, Math.max(0, (event.clientY - bounds.top) / bounds.height * LOGICAL_HEIGHT))
    });
  }

  function playerForStart(point: LogicalPoint): PlayerId {
    return classifyPointerStart(point);
  }

  function ownerForPointer(pointerId: number): PlayerId | undefined {
    if (players[1].pointerId === pointerId) return 1;
    if (players[2].pointerId === pointerId) return 2;
    return undefined;
  }

  function pointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = mapPoint(event);
    if (point === undefined) return;
    const player = playerForStart(point);
    const slot = players[player];
    if (!canAcquirePointer({ 1: players[1].pointerId, 2: players[2].pointerId }, event.pointerId, player)) {
      ignoredPointerCount += 1;
      return;
    }
    event.preventDefault();
    options.onIntentionalGesture?.();
    slot.pointerId = event.pointerId;
    slot.held = true;
    slot.started = true;
    slot.released = false;
    slot.cancelled = false;
    slot.target = point;
    try {
      surface.setPointerCapture(event.pointerId);
    } catch {
      captureFailureCount += 1;
    }
  }

  function pointerMove(event: PointerEvent): void {
    const player = ownerForPointer(event.pointerId);
    if (player === undefined) return;
    event.preventDefault();
    const canvas = getCanvas();
    if (canvas === undefined) return;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    players[player].target = Object.freeze({
      x: Math.min(LOGICAL_WIDTH, Math.max(0, (event.clientX - bounds.left) / bounds.width * LOGICAL_WIDTH)),
      y: Math.min(LOGICAL_HEIGHT, Math.max(0, (event.clientY - bounds.top) / bounds.height * LOGICAL_HEIGHT))
    });
  }

  function releasePointer(event: PointerEvent, cancelled: boolean): void {
    const player = ownerForPointer(event.pointerId);
    if (player === undefined) return;
    event.preventDefault();
    const slot = players[player];
    slot.pointerId = undefined;
    slot.held = false;
    slot.released = !cancelled;
    slot.cancelled = cancelled;
    try {
      if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    } catch {
      captureFailureCount += 1;
    }
  }

  function lostPointerCapture(event: PointerEvent): void {
    const player = ownerForPointer(event.pointerId);
    if (player === undefined) return;
    const slot = players[player];
    slot.pointerId = undefined;
    slot.held = false;
    slot.cancelled = true;
  }

  function clear(): void {
    clearCount += 1;
    for (const player of [1, 2] as const) {
      const slot = players[player];
      if (slot.pointerId !== undefined) {
        try { if (surface.hasPointerCapture(slot.pointerId)) surface.releasePointerCapture(slot.pointerId); }
        catch { captureFailureCount += 1; }
      }
      slot.pointerId = undefined;
      slot.held = false;
      slot.started = false;
      slot.released = false;
      slot.cancelled = true;
      slot.keys.clear();
    }
    pausePressed = false;
  }

  function keyDown(event: KeyboardEvent): void {
    if (event.repeat && event.code === "Space") return;
    if (event.code === "Space" || event.code === "Escape") {
      event.preventDefault();
      pausePressed = true;
      return;
    }
    const mapping = keyMap[event.code];
    if (mapping === undefined) return;
    event.preventDefault();
    players[mapping[0]].keys.add(mapping[1]);
  }

  function keyUp(event: KeyboardEvent): void {
    const mapping = keyMap[event.code];
    if (mapping === undefined) return;
    event.preventDefault();
    players[mapping[0]].keys.delete(mapping[1]);
  }

  function movement(slot: MutablePlayerInput): readonly [number, number] {
    const x = Number(slot.keys.has("right")) - Number(slot.keys.has("left"));
    const y = Number(slot.keys.has("down")) - Number(slot.keys.has("up"));
    if (x === 0 && y === 0) return [0, 0];
    const length = Math.hypot(x, y);
    return [x / length, y / length];
  }

  function bind(nextSurface: HTMLElement): void {
    const boundSurface = nextSurface;
    surface = boundSurface;
    const listeners: Array<readonly [string, EventListener]> = [
      ["pointerdown", pointerDown as EventListener],
      ["pointermove", pointerMove as EventListener],
      ["pointerup", ((event: PointerEvent) => releasePointer(event, false)) as EventListener],
      ["pointercancel", ((event: PointerEvent) => releasePointer(event, true)) as EventListener],
      ["lostpointercapture", lostPointerCapture as EventListener],
      ["contextmenu", ((event: Event) => event.preventDefault()) as EventListener]
    ];
    for (const [name, listener] of listeners) {
      boundSurface.addEventListener(name, listener, { passive: false });
      surfaceRemovers.push(() => boundSurface.removeEventListener(name, listener));
    }
  }

  bind(surface);
  window.addEventListener("keydown", keyDown, { passive: false });
  window.addEventListener("keyup", keyUp, { passive: false });
  const visibilityChange = (): void => { if (document.hidden) clear(); };
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", visibilityChange);
  globalRemovers.push(
    () => window.removeEventListener("keydown", keyDown),
    () => window.removeEventListener("keyup", keyUp),
    () => window.removeEventListener("blur", clear),
    () => document.removeEventListener("visibilitychange", visibilityChange)
  );

  return {
    sampleForStep(): HockeyActionSnapshot {
      function sample(player: PlayerId): PlayerAction {
        const slot = players[player];
        const [moveX, moveY] = movement(slot);
        const result = Object.freeze({
          held: slot.held,
          started: slot.started,
          released: slot.released,
          cancelled: slot.cancelled,
          ...(slot.pointerId === undefined ? {} : { pointerId: slot.pointerId }),
          ...(slot.target === undefined ? {} : { target: slot.target }),
          moveX,
          moveY
        });
        slot.started = false;
        slot.released = false;
        slot.cancelled = false;
        return result;
      }
      const snapshot = Object.freeze({
        players: Object.freeze({ 1: sample(1), 2: sample(2) }),
        pausePressed
      });
      pausePressed = false;
      return snapshot;
    },
    clear,
    requestPause(): void { pausePressed = true; },
    setSurface(nextSurface, nextGetCanvas): void {
      for (const remove of surfaceRemovers.splice(0)) remove();
      getCanvas = nextGetCanvas;
      bind(nextSurface);
    },
    getDiagnostics(): HockeyInputDiagnostics {
      return Object.freeze({
        owners: Object.freeze({ 1: players[1].pointerId ?? null, 2: players[2].pointerId ?? null }),
        held: Object.freeze({ 1: players[1].held, 2: players[2].held }),
        ignoredPointerCount,
        captureFailureCount,
        clearCount
      });
    },
    destroy(): void {
      clear();
      for (const remove of surfaceRemovers.splice(0)) remove();
      for (const remove of globalRemovers.splice(0)) remove();
    }
  };
}

export function classifyPointerStart(point: LogicalPoint): PlayerId {
  return point.y < LOGICAL_HEIGHT / 2 ? 2 : 1;
}

export function canAcquirePointer(
  owners: Readonly<Record<PlayerId, number | undefined>>,
  pointerId: number,
  player: PlayerId
): boolean {
  return owners[player] === undefined && owners[1] !== pointerId && owners[2] !== pointerId;
}
