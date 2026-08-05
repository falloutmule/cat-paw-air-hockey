import { Container, Graphics, Rectangle, Sprite, Text, TextStyle, Texture } from "pixi.js";
import type { SfhsPixiPresenter, SfhsPixiStageLayers } from "@sfhs/adapter-pixi-v8";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, PUCK_RADIUS, READY_TARGET, RINK, STRIKER_RADIUS } from "./constants.ts";
import { goalBounds, puckRadius, settingsSummary, strikerRadius } from "./settings.ts";
import type { ThemeSlot, ValidTheme } from "./theme.ts";
import type { HockeyGameState, PresentationEvent } from "./state.ts";

interface ActiveImpact {
  readonly event: PresentationEvent;
  readonly graphic: Graphics;
}

interface ConfettiPiece {
  readonly graphic: Graphics;
  seed: number;
}

export interface CatHockeyPresenter extends SfhsPixiPresenter<HockeyGameState> {
  setReducedEffects(value: boolean): void;
  setTheme(theme: ValidTheme | undefined): void;
}

const COLORS = Object.freeze({
  table: 0x172331,
  felt: 0x263f4c,
  feltLight: 0x315464,
  rail: 0xa97549,
  railDark: 0x5d3d29,
  cream: 0xfff4d6,
  ink: 0x15202b,
  player1: 0x41d8c7,
  player1Dark: 0x0b6e68,
  player2: 0xff8c78,
  player2Dark: 0x9d403d,
  yarn: 0xffd45c,
  yarnDark: 0xc36b32,
  white: 0xffffff,
  shadow: 0x071018
});

function makeText(text: string, size: number, fill: number = COLORS.cream, weight: "normal" | "bold" = "bold"): Text {
  const label = new Text({
    text,
    style: new TextStyle({
      fontFamily: "system-ui, sans-serif",
      fontSize: size,
      fontWeight: weight,
      fill,
      align: "center",
      stroke: { color: COLORS.shadow, width: Math.max(2, Math.round(size * 0.08)) },
      dropShadow: { color: COLORS.shadow, alpha: 0.5, blur: 2, distance: 2 }
    })
  });
  label.anchor.set(0.5);
  label.eventMode = "none";
  return label;
}

function drawPaw(graphic: Graphics, color: number, dark: number): void {
  graphic.clear()
    .circle(0, 6, STRIKER_RADIUS - 5).fill({ color: dark, alpha: 0.42 })
    .ellipse(0, 8, 31, 27).fill({ color })
    .circle(-27, -14, 13).fill({ color })
    .circle(-9, -25, 14).fill({ color })
    .circle(10, -25, 14).fill({ color })
    .circle(28, -13, 13).fill({ color })
    .ellipse(0, 10, 18, 15).fill({ color: COLORS.cream, alpha: 0.66 })
    .circle(-26, -14, 6).fill({ color: COLORS.cream, alpha: 0.55 })
    .circle(-9, -25, 6).fill({ color: COLORS.cream, alpha: 0.55 })
    .circle(10, -25, 6).fill({ color: COLORS.cream, alpha: 0.55 })
    .circle(28, -13, 6).fill({ color: COLORS.cream, alpha: 0.55 });
}

function drawYarn(graphic: Graphics): void {
  graphic.clear()
    .circle(0, 0, PUCK_RADIUS + 4).fill({ color: COLORS.shadow, alpha: 0.44 })
    .circle(0, 0, PUCK_RADIUS).fill({ color: COLORS.yarn })
    .arc(0, 0, 15, -2.5, 0.7).stroke({ color: COLORS.yarnDark, width: 4, alpha: 0.9 })
    .arc(0, 0, 11, -0.2, 2.8).stroke({ color: COLORS.yarnDark, width: 3, alpha: 0.82 })
    .moveTo(-18, -4).bezierCurveTo(-5, -17, 7, 16, 18, 4).stroke({ color: COLORS.cream, width: 2, alpha: 0.8 });
}

function drawCatGoal(graphic: Graphics, top: boolean, color: number, left: number = RINK.goalLeft, right: number = RINK.goalRight): void {
  const outerY = top ? RINK.top - 52 : RINK.bottom;
  const innerY = top ? RINK.top - 42 : RINK.bottom;
  const earBaseY = top ? RINK.top - 22 : RINK.bottom + 22;
  const earTipY = top ? RINK.top - 51 : RINK.bottom + 51;
  graphic.clear()
    .roundRect(left - 14, outerY, right - left + 28, 52, 16)
    .fill({ color: COLORS.railDark })
    .roundRect(left + 3, innerY, right - left - 6, 42, 13)
    .fill({ color: COLORS.shadow })
    .moveTo(left + 18, earBaseY).lineTo(left + 40, earTipY).lineTo(left + 60, earBaseY).fill({ color })
    .moveTo(right - 18, earBaseY).lineTo(right - 40, earTipY).lineTo(right - 60, earBaseY).fill({ color });
}

function asPixiColor(value: string): number {
  return Number.parseInt(value.slice(1), 16);
}

export function createCatHockeyPresenter(options: {
  readonly onEvents?: (events: readonly PresentationEvent[]) => void;
} = {}): CatHockeyPresenter {
  let initialized = false;
  let destroyed = false;
  let reducedEffects = false;
  let lastEventId = 0;
  let staticRoot: Container;
  let actorRoot: Container;
  let effectsRoot: Container;
  let hudRoot: Container;
  let paw1: Container;
  let paw2: Container;
  let paw1Graphic: Graphics;
  let paw2Graphic: Graphics;
  let puck: Container;
  let puckGraphic: Graphics;
  let puckHighlight: Graphics;
  let score1: Text;
  let score2: Text;
  let centerMessage1: Text;
  let centerMessage2: Text;
  let ready1: Graphics;
  let ready2: Graphics;
  let readyLabel1: Text;
  let readyLabel2: Text;
  let instruction1: Text;
  let instruction2: Text;
  let topCat: Graphics;
  let bottomCat: Graphics;
  let goalTop: Graphics;
  let goalBottom: Graphics;
  let posts: Graphics;
  let paletteOverlay: Graphics;
  let settingsLabel1: Text;
  let settingsLabel2: Text;
  let themeRoot: Container;
  let themeTexture: Texture | undefined;
  let themeSprites: Partial<Record<ThemeSlot, Sprite>> = {};
  let theme: ValidTheme | undefined;
  const trail: Graphics[] = [];
  const impactPool: Graphics[] = [];
  const activeImpacts: ActiveImpact[] = [];
  const confetti: ConfettiPiece[] = [];
  let shakeEvent: PresentationEvent | undefined;
  let celebrationEvent: PresentationEvent | undefined;

  function initialize(layers: SfhsPixiStageLayers): void {
    if (initialized) return;
    initialized = true;
    staticRoot = new Container({ label: "cat-hockey-static" });
    actorRoot = new Container({ label: "cat-hockey-actors" });
    effectsRoot = new Container({ label: "cat-hockey-effects" });
    hudRoot = new Container({ label: "cat-hockey-hud" });
    staticRoot.eventMode = "none";
    actorRoot.eventMode = "none";
    effectsRoot.eventMode = "none";
    effectsRoot.interactiveChildren = false;
    hudRoot.eventMode = "none";
    layers.backgroundLayer.addChild(staticRoot);
    layers.actorLayer.addChild(actorRoot);
    layers.worldEffectsLayer.addChild(effectsRoot);
    layers.hudLayer.addChild(hudRoot);
    themeRoot = new Container({ label: "cat-hockey-theme" });
    themeRoot.eventMode = "none";
    layers.actorLayer.addChild(themeRoot);

    const backdrop = new Graphics()
      .rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill({ color: COLORS.table })
      .roundRect(18, 20, LOGICAL_WIDTH - 36, LOGICAL_HEIGHT - 40, 34).fill({ color: COLORS.railDark })
      .roundRect(29, 31, LOGICAL_WIDTH - 58, LOGICAL_HEIGHT - 62, 28).fill({ color: COLORS.rail })
      .roundRect(RINK.left - 8, RINK.top - 8, RINK.right - RINK.left + 16, RINK.bottom - RINK.top + 16, 25).fill({ color: COLORS.felt });
    const markings = new Graphics()
      .rect(RINK.left, RINK.centerY - 2, RINK.right - RINK.left, 4).fill({ color: COLORS.cream, alpha: 0.34 })
      .circle(LOGICAL_WIDTH / 2, RINK.centerY, 74).stroke({ color: COLORS.cream, width: 5, alpha: 0.3 })
      .circle(LOGICAL_WIDTH / 2, RINK.centerY, 8).fill({ color: COLORS.cream, alpha: 0.5 });
    for (let i = 0; i < 7; i += 1) {
      const y = RINK.top + 110 + i * 106;
      markings.circle(RINK.left + 22, y, 6).fill({ color: COLORS.cream, alpha: 0.16 });
      markings.circle(RINK.right - 22, y, 6).fill({ color: COLORS.cream, alpha: 0.16 });
    }
    const railDetails = new Graphics();
    for (let y = 76; y < 900; y += 52) {
      railDetails.moveTo(27, y).lineTo(40, y + 20).stroke({ color: COLORS.cream, width: 3, alpha: 0.18 });
      railDetails.moveTo(513, y).lineTo(500, y + 20).stroke({ color: COLORS.cream, width: 3, alpha: 0.18 });
    }
    goalTop = new Graphics();
    goalBottom = new Graphics();
    drawCatGoal(goalTop, true, COLORS.player2);
    drawCatGoal(goalBottom, false, COLORS.player1);
    posts = new Graphics();
    for (const y of [RINK.top, RINK.bottom]) {
      for (const x of [RINK.goalLeft, RINK.goalRight]) {
        posts.circle(x, y, RINK.postRadius + 5).fill({ color: COLORS.railDark })
          .circle(x, y, RINK.postRadius).fill({ color: COLORS.cream });
      }
    }
    paletteOverlay = new Graphics();
    staticRoot.addChild(backdrop, paletteOverlay, markings, railDetails, goalTop, goalBottom, posts);

    bottomCat = new Graphics();
    topCat = new Graphics();
    const drawFace = (graphic: Graphics, color: number, dark: number): void => {
      graphic.clear().circle(0, 0, 38).fill({ color })
        .moveTo(-32, -22).lineTo(-45, -53).lineTo(-12, -35).fill({ color })
        .moveTo(32, -22).lineTo(45, -53).lineTo(12, -35).fill({ color })
        .circle(-14, -3, 5).fill({ color: dark }).circle(14, -3, 5).fill({ color: dark })
        .moveTo(-5, 11).lineTo(0, 16).lineTo(5, 11).fill({ color: 0xf4a6a6 })
        .moveTo(-8, 20).quadraticCurveTo(0, 27, 8, 20).stroke({ color: dark, width: 3 });
    };
    drawFace(bottomCat, COLORS.player1, COLORS.player1Dark);
    drawFace(topCat, COLORS.player2, COLORS.player2Dark);
    bottomCat.position.set(68, 872);
    topCat.position.set(472, 88);
    topCat.rotation = Math.PI;
    staticRoot.addChild(bottomCat, topCat);

    paw1 = new Container({ label: "player-1-paw" });
    paw2 = new Container({ label: "player-2-paw" });
    paw1Graphic = new Graphics();
    paw2Graphic = new Graphics();
    drawPaw(paw1Graphic, COLORS.player1, COLORS.player1Dark);
    drawPaw(paw2Graphic, COLORS.player2, COLORS.player2Dark);
    paw2Graphic.rotation = Math.PI;
    paw1.addChild(paw1Graphic);
    paw2.addChild(paw2Graphic);
    actorRoot.addChild(paw1, paw2);

    puck = new Container({ label: "yarn-puck" });
    puckGraphic = new Graphics();
    puckHighlight = new Graphics().circle(-7, -8, 5).fill({ color: COLORS.white, alpha: 0.7 });
    drawYarn(puckGraphic);
    puck.addChild(puckGraphic, puckHighlight);
    actorRoot.addChild(puck);

    for (let i = 0; i < 9; i += 1) {
      const dot = new Graphics().circle(0, 0, Math.max(3, PUCK_RADIUS - i * 2.1)).fill({ color: COLORS.yarn, alpha: 0.18 });
      trail.push(dot);
      effectsRoot.addChild(dot);
    }
    for (let i = 0; i < 18; i += 1) {
      const effect = new Graphics();
      effect.visible = false;
      impactPool.push(effect);
      effectsRoot.addChild(effect);
    }
    for (let i = 0; i < 36; i += 1) {
      const piece = new Graphics().moveTo(-5, 0).lineTo(0, -7).lineTo(5, 0).lineTo(0, 7).fill({ color: i % 3 === 0 ? COLORS.yarn : i % 3 === 1 ? COLORS.player1 : COLORS.player2 });
      piece.visible = false;
      confetti.push({ graphic: piece, seed: i });
      effectsRoot.addChild(piece);
    }

    score1 = makeText("0", 54, COLORS.player1);
    score2 = makeText("0", 54, COLORS.player2);
    score1.position.set(472, 846);
    score2.position.set(68, 114);
    score2.rotation = Math.PI;
    centerMessage1 = makeText("", 32);
    centerMessage2 = makeText("", 32);
    centerMessage1.position.set(270, 526);
    centerMessage2.position.set(270, 434);
    centerMessage2.rotation = Math.PI;

    ready1 = new Graphics();
    ready2 = new Graphics();
    readyLabel1 = makeText("HOLD PAW TO READY", 20, COLORS.player1);
    readyLabel2 = makeText("HOLD PAW TO READY", 20, COLORS.player2);
    readyLabel1.position.set(270, 866);
    readyLabel2.position.set(270, 94);
    readyLabel2.rotation = Math.PI;
    instruction1 = makeText("PHONE FLAT • ONE CAT EACH END • ONE FINGER", 17, COLORS.cream, "normal");
    instruction2 = makeText("PHONE FLAT • ONE CAT EACH END • ONE FINGER", 17, COLORS.cream, "normal");
    instruction1.position.set(270, 600);
    instruction2.position.set(270, 360);
    instruction2.rotation = Math.PI;
    settingsLabel1 = makeText("Classic settings", 13, COLORS.cream, "normal");
    settingsLabel2 = makeText("Classic settings", 13, COLORS.cream, "normal");
    settingsLabel1.position.set(270, 642);
    settingsLabel2.position.set(270, 318);
    settingsLabel2.rotation = Math.PI;
    settingsLabel1.visible = false;
    settingsLabel2.visible = false;
    hudRoot.addChild(score1, score2, centerMessage1, centerMessage2, ready1, ready2, readyLabel1, readyLabel2, instruction1, instruction2, settingsLabel1, settingsLabel2);
  }

  function consumeEvents(state: Readonly<HockeyGameState>): void {
    const fresh = state.events.filter((event) => event.id > lastEventId);
    if (fresh.length === 0) return;
    lastEventId = Math.max(lastEventId, ...fresh.map((event) => event.id));
    options.onEvents?.(fresh);
    for (const event of fresh) {
      if (event.kind === "paw-hit" || event.kind === "wall-hit" || event.kind === "goal") {
        const graphic = impactPool.find((candidate) => !candidate.visible);
        if (graphic !== undefined) {
          graphic.visible = true;
          activeImpacts.push({ event, graphic });
        }
        if (event.strength > 0.55) shakeEvent = event;
      }
      if (event.kind === "goal" || event.kind === "win") {
        celebrationEvent = event;
        for (const piece of confetti) {
          piece.seed = (piece.seed * 1103515245 + event.id * 12345 + 12345) >>> 0;
          piece.graphic.visible = !reducedEffects || piece.seed % 3 === 0;
        }
      }
    }
  }

  function updateImpacts(state: Readonly<HockeyGameState>): void {
    for (let index = activeImpacts.length - 1; index >= 0; index -= 1) {
      const active = activeImpacts[index];
      const age = (state.tick - active.event.tick) / 60;
      if (age > 0.26) {
        active.graphic.visible = false;
        activeImpacts.splice(index, 1);
        continue;
      }
      const progress = age / 0.26;
      const radius = 18 + progress * (active.event.kind === "goal" ? 120 : 54) * active.event.strength;
      active.graphic.clear().circle(0, 0, radius).stroke({
        color: active.event.kind === "goal" ? COLORS.yarn : COLORS.cream,
        width: Math.max(2, 8 * (1 - progress)),
        alpha: 0.85 * (1 - progress)
      });
      active.graphic.position.set(active.event.x, active.event.y);
    }
  }

  function updateConfetti(state: Readonly<HockeyGameState>): void {
    const event = celebrationEvent;
    for (let index = 0; index < confetti.length; index += 1) {
      const piece = confetti[index];
      if (!piece.graphic.visible || event === undefined) continue;
      const age = (state.tick - event.tick) / 60;
      if (age > 0.9) { piece.graphic.visible = false; if (index === confetti.length - 1) celebrationEvent = undefined; continue; }
      const angle = (piece.seed % 6283) / 1000;
      const speed = 85 + (piece.seed % 160);
      const originY = event.player === 1 ? RINK.top : RINK.bottom;
      piece.graphic.position.set(
        270 + Math.cos(angle) * speed * age,
        originY + (event.player === 1 ? 1 : -1) * (Math.sin(angle) * speed * age + 170 * age * age)
      );
      piece.graphic.rotation = angle + age * 7;
      piece.graphic.alpha = 1 - age / 0.9;
    }
  }

  function updateHud(state: Readonly<HockeyGameState>): void {
    if (score1.text !== String(state.scores[1])) score1.text = String(state.scores[1]);
    if (score2.text !== String(state.scores[2])) score2.text = String(state.scores[2]);
    const readyVisible = state.phase === "ready" || state.phase === "won";
    ready1.visible = readyVisible;
    ready2.visible = readyVisible;
    readyLabel1.visible = readyVisible;
    readyLabel2.visible = readyVisible;
    instruction1.visible = state.phase === "ready";
    instruction2.visible = state.phase === "ready";
    const drawReady = (graphic: Graphics, player: 1 | 2, color: number): void => {
      const target = READY_TARGET[player];
      const progress = state.players[player].readyProgress;
      graphic.clear().circle(target.x, target.y, 70).fill({ color, alpha: 0.08 })
        .circle(target.x, target.y, 70).stroke({ color, width: 7, alpha: 0.34 })
        .moveTo(target.x, target.y - 70)
        .arc(target.x, target.y, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
        .stroke({ color, width: 10, alpha: 0.95 });
    };
    drawReady(ready1, 1, COLORS.player1);
    drawReady(ready2, 2, COLORS.player2);

    let message = "";
    if (state.phase === "ready") message = "FIRST TO 5";
    else if (state.phase === "countdown") message = String(Math.max(1, Math.ceil(state.phaseTimer)));
    else if (state.phase === "goal") message = "GOAL!";
    else if (state.phase === "paused") message = "PAUSED";
    else if (state.phase === "won") message = state.winner === 1 ? "TEAL CAT WINS!" : "CORAL CAT WINS!";
    centerMessage1.text = message;
    centerMessage2.text = message;
    centerMessage1.visible = message.length > 0;
    centerMessage2.visible = message.length > 0;
    readyLabel1.text = state.phase === "won" ? "BOTH HOLD FOR REMATCH" : state.players[1].ready ? "READY!" : "HOLD PAW TO READY";
    readyLabel2.text = state.phase === "won" ? "BOTH HOLD FOR REMATCH" : state.players[2].ready ? "READY!" : "HOLD PAW TO READY";
    const showSettings = state.phase === "won";
    settingsLabel1.visible = showSettings;
    settingsLabel2.visible = showSettings;
    if (showSettings) {
      const summary = settingsSummary(state.activeMatchSettings);
      settingsLabel1.text = summary;
      settingsLabel2.text = summary;
    }
  }

  function updateGeometry(state: Readonly<HockeyGameState>): void {
    const top = goalBounds(state.activeMatchSettings, 2);
    const bottom = goalBounds(state.activeMatchSettings, 1);
    const player1 = theme === undefined ? COLORS.player1 : asPixiColor(theme.palette.player1);
    const player2 = theme === undefined ? COLORS.player2 : asPixiColor(theme.palette.player2);
    drawCatGoal(goalTop, true, player2, top.left, top.right);
    drawCatGoal(goalBottom, false, player1, bottom.left, bottom.right);
    posts.clear();
    for (const [y, goal] of [[RINK.top, top], [RINK.bottom, bottom]] as const) {
      for (const x of [goal.left, goal.right]) posts.circle(x, y, RINK.postRadius + 5).fill({ color: theme === undefined ? COLORS.railDark : asPixiColor(theme.palette.rail) }).circle(x, y, RINK.postRadius).fill({ color: theme === undefined ? COLORS.cream : asPixiColor(theme.palette.markings) });
    }
  }

  function updateThemePalette(): void {
    paletteOverlay.clear();
    if (theme === undefined) return;
    const palette = theme.palette;
    paletteOverlay
      .rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill({ color: asPixiColor(palette.table), alpha: 0.56 })
      .roundRect(18, 20, LOGICAL_WIDTH - 36, LOGICAL_HEIGHT - 40, 34).fill({ color: asPixiColor(palette.rail), alpha: 0.34 })
      .roundRect(RINK.left - 8, RINK.top - 8, RINK.right - RINK.left + 16, RINK.bottom - RINK.top + 16, 25).fill({ color: asPixiColor(palette.felt), alpha: 0.46 });
  }

  function applyTheme(): void {
    if (!initialized) return;
    themeRoot.removeChildren().forEach((child) => child.destroy());
    themeSprites = {};
    themeTexture?.destroy(false);
    themeTexture = undefined;
    updateThemePalette();
    if (theme === undefined) return;
    themeTexture = Texture.from(theme.url);
    const cells: Readonly<Record<string, number>> = Object.freeze({ paw1: 0, paw2: 1, puck: 2, emblem: 3, mascot1: 4, mascot2: 5, goal1: 6, goal2: 7, impact: 8, confetti: 9, winner: 10, corner: 11 });
    for (const [name, cell] of Object.entries(cells)) {
      if (!theme.slots[name as ThemeSlot]) continue;
      const sprite = new Sprite(new Texture({ source: themeTexture.source, frame: new Rectangle(cell % 4 * 256, Math.floor(cell / 4) * 256, 256, 256) }));
      sprite.anchor.set(0.5); sprite.eventMode = "none"; themeSprites[name as ThemeSlot] = sprite; themeRoot.addChild(sprite);
    }
  }

  function setThemeSprite(name: ThemeSlot, x: number, y: number, width: number, height: number, visible = true): Sprite | undefined {
    const sprite = themeSprites[name];
    if (sprite !== undefined) { sprite.position.set(x, y); sprite.width = width; sprite.height = height; sprite.visible = visible; }
    return sprite;
  }

  return {
    present(state, _alpha, layers): void {
      if (destroyed) return;
      initialize(layers);
      reducedEffects = state.reducedEffects;
      consumeEvents(state);
      paw1.position.set(state.players[1].position.x, state.players[1].position.y);
      paw2.position.set(state.players[2].position.x, state.players[2].position.y);
      const speed1 = Math.hypot(state.players[1].velocity.x, state.players[1].velocity.y);
      const speed2 = Math.hypot(state.players[2].velocity.x, state.players[2].velocity.y);
      const scale1 = strikerRadius(state.activeMatchSettings, 1) / STRIKER_RADIUS;
      const scale2 = strikerRadius(state.activeMatchSettings, 2) / STRIKER_RADIUS;
      paw1.scale.set(scale1 * (1 + Math.min(0.08, speed1 / 24_000)), scale1 * (1 - Math.min(0.06, speed1 / 28_000)));
      paw2.scale.set(scale2 * (1 + Math.min(0.08, speed2 / 24_000)), scale2 * (1 - Math.min(0.06, speed2 / 28_000)));
      puck.position.set(state.puck.position.x, state.puck.position.y);
      puck.scale.set(puckRadius(state.activeMatchSettings) / PUCK_RADIUS);
      puck.rotation = state.tick * Math.hypot(state.puck.velocity.x, state.puck.velocity.y) / 240_000;
      for (let index = 0; index < trail.length; index += 1) {
        const point = state.puck.trail[index];
        const dot = trail[index];
        dot.visible = !reducedEffects && point !== undefined && state.phase === "playing";
        if (point !== undefined) {
          dot.position.set(point.x, point.y);
          dot.alpha = 0.2 * (1 - index / trail.length);
        }
      }
      updateImpacts(state);
      updateConfetti(state);
      updateGeometry(state);
      const themedPaw1 = themeSprites.paw1; const themedPaw2 = themeSprites.paw2; const themedPuck = themeSprites.puck;
      if (themedPaw1 !== undefined) { themedPaw1.position.copyFrom(paw1.position); themedPaw1.width = strikerRadius(state.activeMatchSettings, 1) * 2; themedPaw1.height = strikerRadius(state.activeMatchSettings, 1) * 2; paw1Graphic.visible = false; } else paw1Graphic.visible = true;
      if (themedPaw2 !== undefined) { themedPaw2.position.copyFrom(paw2.position); themedPaw2.width = strikerRadius(state.activeMatchSettings, 2) * 2; themedPaw2.height = strikerRadius(state.activeMatchSettings, 2) * 2; themedPaw2.rotation = Math.PI; paw2Graphic.visible = false; } else paw2Graphic.visible = true;
      if (themedPuck !== undefined) { themedPuck.position.copyFrom(puck.position); themedPuck.width = puckRadius(state.activeMatchSettings) * 2; themedPuck.height = puckRadius(state.activeMatchSettings) * 2; puckGraphic.visible = false; puckHighlight.visible = false; } else { puckGraphic.visible = true; puckHighlight.visible = true; }
      const topGoal = goalBounds(state.activeMatchSettings, 2);
      const bottomGoal = goalBounds(state.activeMatchSettings, 1);
      const themedGoal2 = setThemeSprite("goal2", 270, RINK.top - 14, topGoal.right - topGoal.left + 74, 78);
      const themedGoal1 = setThemeSprite("goal1", 270, RINK.bottom + 14, bottomGoal.right - bottomGoal.left + 74, 78);
      goalTop.visible = themedGoal2 === undefined;
      goalBottom.visible = themedGoal1 === undefined;
      const themedMascot1 = setThemeSprite("mascot1", 68, 872, 82, 82);
      const themedMascot2 = setThemeSprite("mascot2", 472, 88, 82, 82);
      bottomCat.visible = themedMascot1 === undefined;
      topCat.visible = themedMascot2 === undefined;
      setThemeSprite("emblem", 270, RINK.centerY, 132, 132, state.phase !== "playing");
      setThemeSprite("corner", RINK.left + 30, RINK.centerY, 52, 52);
      setThemeSprite("winner", 270, RINK.centerY, 210, 210, state.phase === "won");
      setThemeSprite("impact", state.puck.position.x, state.puck.position.y, 96, 96, activeImpacts.length > 0 && !reducedEffects);
      setThemeSprite("confetti", 270, state.winner === 1 ? 180 : 780, 190, 190, celebrationEvent !== undefined && !reducedEffects);
      updateHud(state);
      bottomCat.scale.set(1);
      topCat.scale.set(1);
      bottomCat.rotation = 0;
      topCat.rotation = Math.PI;
      if (state.phase === "won" && state.winner !== undefined) {
        const winnerCat = state.winner === 1 ? bottomCat : topCat;
        const loserCat = state.winner === 1 ? topCat : bottomCat;
        const winnerBaseRotation = state.winner === 1 ? 0 : Math.PI;
        const loserBaseRotation = state.winner === 1 ? Math.PI : 0;
        const bounce = reducedEffects ? 0.04 : 0.11;
        const pulse = 1 + Math.sin(state.tick * 0.18) * bounce;
        winnerCat.scale.set(pulse, 1 + Math.cos(state.tick * 0.18) * bounce * 0.55);
        winnerCat.rotation = winnerBaseRotation + Math.sin(state.tick * 0.12) * (reducedEffects ? 0.025 : 0.075);
        loserCat.scale.set(0.94, 0.9);
        loserCat.rotation = loserBaseRotation + Math.sin(state.tick * 0.08) * 0.035;
      }
      layers.worldRoot.position.set(0, 0);
      if (!reducedEffects && shakeEvent !== undefined) {
        const age = (state.tick - shakeEvent.tick) / 60;
        if (age < 0.12) {
          const magnitude = (1 - age / 0.12) * 2.2 * shakeEvent.strength;
          layers.worldRoot.position.set(Math.sin(state.tick * 4.1) * magnitude, Math.cos(state.tick * 3.7) * magnitude);
        } else {
          shakeEvent = undefined;
        }
      }
    },
    setReducedEffects(value): void { reducedEffects = value; },
    setTheme(value): void { if (theme !== undefined) URL.revokeObjectURL(theme.url); theme = value; applyTheme(); },
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      staticRoot?.destroy({ children: true });
      actorRoot?.destroy({ children: true });
      effectsRoot?.destroy({ children: true });
      hudRoot?.destroy({ children: true });
      activeImpacts.length = 0;
      impactPool.length = 0;
      confetti.length = 0;
      trail.length = 0;
      themeTexture?.destroy(false);
    }
  };
}
