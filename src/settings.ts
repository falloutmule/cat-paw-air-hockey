import { LOGICAL_CENTER, PUCK_RADIUS, PUCK_SPEED_CAP, RINK, STRIKER_IMPULSE_SPEED_CAP, STRIKER_MAX_SPEED, STRIKER_RADIUS } from "./constants.ts";
import type { PlayerId } from "./actions.ts";

export interface MatchSettings {
  readonly puckSpeed: number;
  readonly pawSpeed: Readonly<Record<PlayerId, number>>;
  readonly returnSpeed: Readonly<Record<PlayerId, number>>;
  readonly puckSize: number;
  readonly pawSize: Readonly<Record<PlayerId, number>>;
  readonly goalSize: Readonly<Record<PlayerId, number>>;
}

export const SIZE_SETTING_MINIMUM = 25;
export const SIZE_SETTING_MAXIMUM = 200;
export const SPEED_SETTING_MINIMUM = 70;
export const SPEED_SETTING_MAXIMUM = 130;

export const DEFAULT_MATCH_SETTINGS: MatchSettings = Object.freeze({
  puckSpeed: 75,
  pawSpeed: Object.freeze({ 1: 75, 2: 75 }),
  returnSpeed: Object.freeze({ 1: 75, 2: 75 }),
  puckSize: 125,
  pawSize: Object.freeze({ 1: 125, 2: 125 }),
  goalSize: Object.freeze({ 1: 125, 2: 125 })
});

const clampStep = (value: unknown, low: number, high: number, fallback: number): number => {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(high, Math.max(low, Math.round(numeric / 5) * 5));
};

export function normalizeMatchSettings(value: Partial<MatchSettings> | undefined): MatchSettings {
  return Object.freeze({
    puckSpeed: clampStep(value?.puckSpeed, SPEED_SETTING_MINIMUM, SPEED_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.puckSpeed),
    pawSpeed: Object.freeze({
      1: clampStep(value?.pawSpeed?.[1], SPEED_SETTING_MINIMUM, SPEED_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.pawSpeed[1]),
      2: clampStep(value?.pawSpeed?.[2], SPEED_SETTING_MINIMUM, SPEED_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.pawSpeed[2])
    }),
    returnSpeed: Object.freeze({
      1: clampStep(value?.returnSpeed?.[1], SPEED_SETTING_MINIMUM, SPEED_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.returnSpeed[1]),
      2: clampStep(value?.returnSpeed?.[2], SPEED_SETTING_MINIMUM, SPEED_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.returnSpeed[2])
    }),
    puckSize: clampStep(value?.puckSize, SIZE_SETTING_MINIMUM, SIZE_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.puckSize),
    pawSize: Object.freeze({
      1: clampStep(value?.pawSize?.[1], SIZE_SETTING_MINIMUM, SIZE_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.pawSize[1]),
      2: clampStep(value?.pawSize?.[2], SIZE_SETTING_MINIMUM, SIZE_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.pawSize[2])
    }),
    goalSize: Object.freeze({
      1: clampStep(value?.goalSize?.[1], SIZE_SETTING_MINIMUM, SIZE_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.goalSize[1]),
      2: clampStep(value?.goalSize?.[2], SIZE_SETTING_MINIMUM, SIZE_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.goalSize[2])
    })
  });
}

export function settingsEqual(left: MatchSettings, right: MatchSettings): boolean {
  return left.puckSpeed === right.puckSpeed && left.puckSize === right.puckSize
    && left.pawSpeed[1] === right.pawSpeed[1] && left.pawSpeed[2] === right.pawSpeed[2]
    && left.returnSpeed[1] === right.returnSpeed[1] && left.returnSpeed[2] === right.returnSpeed[2]
    && left.pawSize[1] === right.pawSize[1] && left.pawSize[2] === right.pawSize[2]
    && left.goalSize[1] === right.goalSize[1] && left.goalSize[2] === right.goalSize[2];
}

export function settingScale(value: number): number { return value / 100; }
export function puckRadius(settings: MatchSettings): number { return PUCK_RADIUS * settingScale(settings.puckSize); }
export function strikerRadius(settings: MatchSettings, player: PlayerId): number { return STRIKER_RADIUS * settingScale(settings.pawSize[player]); }
export function puckSpeedCap(settings: MatchSettings): number { return PUCK_SPEED_CAP * settingScale(settings.puckSpeed); }
export function returnSpeedCap(settings: MatchSettings, player: PlayerId): number { return puckSpeedCap(settings) * settingScale(settings.returnSpeed[player]); }
export function strikerSpeedCap(settings: MatchSettings, player: PlayerId): number { return STRIKER_MAX_SPEED * settingScale(settings.pawSpeed[player]); }
export function strikerImpulseCap(settings: MatchSettings, player: PlayerId): number { return STRIKER_IMPULSE_SPEED_CAP * settingScale(settings.pawSpeed[player]); }
export function goalBounds(settings: MatchSettings, defender: PlayerId): Readonly<{ left: number; right: number }> {
  const width = (RINK.goalRight - RINK.goalLeft) * settingScale(settings.goalSize[defender]);
  return Object.freeze({ left: LOGICAL_CENTER.x - width / 2, right: LOGICAL_CENTER.x + width / 2 });
}

export function minimumPlayableGoalSize(puckSize: number): number {
  const normalizedPuckSize = clampStep(puckSize, SIZE_SETTING_MINIMUM, SIZE_SETTING_MAXIMUM, DEFAULT_MATCH_SETTINGS.puckSize);
  const clearanceWidth = 2 * (PUCK_RADIUS * settingScale(normalizedPuckSize) + RINK.postRadius + 2);
  const baseGoalWidth = RINK.goalRight - RINK.goalLeft;
  return Math.min(SIZE_SETTING_MAXIMUM, Math.max(SIZE_SETTING_MINIMUM, Math.ceil(clearanceWidth / baseGoalWidth * 100 / 5) * 5));
}

export function incompatibleGoalPlayers(settings: MatchSettings): readonly PlayerId[] {
  const minimum = minimumPlayableGoalSize(settings.puckSize);
  return Object.freeze(([1, 2] as const).filter((player) => settings.goalSize[player] < minimum));
}

export function isDefaultSettings(settings: MatchSettings): boolean { return settingsEqual(settings, DEFAULT_MATCH_SETTINGS); }
export const isClassicSettings = isDefaultSettings;

export function settingsSummary(settings: MatchSettings): string {
  if (isDefaultSettings(settings)) return "Normal settings";
  return `Puck: ${settings.puckSpeed}% speed / ${settings.puckSize}% size | P1: ${settings.pawSpeed[1]}% paw speed / ${settings.returnSpeed[1]}% return / ${settings.pawSize[1]}% paw / ${settings.goalSize[1]}% goal | P2: ${settings.pawSpeed[2]}% paw speed / ${settings.returnSpeed[2]}% return / ${settings.pawSize[2]}% paw / ${settings.goalSize[2]}% goal`;
}
