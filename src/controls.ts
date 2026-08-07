import type { MatchPhase } from "./state.ts";

export const SHARED_CONTROL_POSITIONS = Object.freeze({
  mute: "upper-left",
  pause: "lower-left",
  capture: "lower-left",
  menu: "upper-right",
  fullscreen: "lower-right"
} as const);

export function lowerLeftControl(phase: MatchPhase | undefined): "pause" | "capture" {
  return phase === "won" ? "capture" : "pause";
}
