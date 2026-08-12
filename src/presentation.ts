import { Container, Graphics, NineSliceSprite, Rectangle, Sprite, Text, TextStyle, Texture } from "pixi.js";
import type { SfhsPixiPresenter, SfhsPixiStageLayers } from "@sfhs/adapter-pixi-v8";
import { BOARD, LOGICAL_CENTER, LOGICAL_HEIGHT, LOGICAL_WIDTH, PUCK_RADIUS, READY_TARGET, RINK, STRIKER_RADIUS } from "./constants.ts";
import { goalBounds, puckRadius, strikerRadius } from "./settings.ts";
import type { ThemeSlot, ValidBoard, ValidTheme } from "./theme.ts";
import type { HockeyGameState, PresentationEvent } from "./state.ts";
import { resolveScoreCatFrames, type ScoreCatFrames, type ScoreCatReaction } from "./score-cat-animation.ts";
import defaultBoardTemplateUrl from "../art/theme/cat-paw-board-template.png";
import defaultCouchGoalUrl from "../art/goals/cat-paw-couch-goal.png";
import scoreCatPlayer1Url from "../art/score-cats/cat-paw-score-cat-p1.png";
import scoreCatPlayer2Url from "../art/score-cats/cat-paw-score-cat-p2.png";

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
  setBoard(board: ValidBoard | undefined): void;
  getBoardDiagnostics(): Readonly<{ mode: "default" | "custom"; spriteCount: 1; replacementCount: number; disposedOwnedTextureCount: number }>;
  getGoalDiagnostics(): Readonly<{ architecture: "pixi-nine-slice"; textureSampling: "nearest"; top: GoalDiagnostic; bottom: GoalDiagnostic }>;
  getPawDiagnostics(): Readonly<{ top: PawDiagnostic; bottom: PawDiagnostic }>;
  getScoreCatDiagnostics(): Readonly<{ top: ScoreCatDiagnostic; bottom: ScoreCatDiagnostic }>;
}

export interface GoalDiagnostic { readonly openingWidth: number; readonly visualWidth: number; readonly labelScale: number; readonly rotation: number; }
export interface PawDiagnostic { readonly nominalDiameter: number; readonly renderedScaleX: number; readonly renderedScaleY: number; readonly presentation: "procedural" | "theme"; }
export interface ScoreCatDiagnostic { readonly frame: number; readonly reaction: ScoreCatReaction; readonly sheet: string; readonly sha256: string; readonly scale: Readonly<{ x: number; y: number }>; readonly anchor: Readonly<{ x: number; y: number }>; readonly rotation: number; }

const COUCH_GOAL = Object.freeze({ capWidth: 24, borderHeight: 8, height: 54, visualPadding: 48, outerStroke: 10, innerStroke: 4 });

interface PreparedPresentationImages {
  readonly board: HTMLImageElement;
  readonly couch: HTMLImageElement;
  readonly scoreCatPlayer1: HTMLImageElement;
  readonly scoreCatPlayer2: HTMLImageElement;
}

let preparedPresentationImages: PreparedPresentationImages | undefined;

async function loadPresentationImage(source: string, label: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "sync";
  const loaded = new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error(`Could not decode ${label}.`)), { once: true });
  });
  image.src = source;
  await loaded;
  return image;
}

export async function prepareCatHockeyPresentationAssets(): Promise<void> {
  if (preparedPresentationImages !== undefined) return;
  const [board, couch, scoreCatPlayer1, scoreCatPlayer2] = await Promise.all([
    loadPresentationImage(defaultBoardTemplateUrl, "the default Board image"),
    loadPresentationImage(defaultCouchGoalUrl, "the couch goal image"),
    loadPresentationImage(scoreCatPlayer1Url, "the Player 1 score-cat sheet"),
    loadPresentationImage(scoreCatPlayer2Url, "the Player 2 score-cat sheet")
  ]);
  preparedPresentationImages = Object.freeze({ board, couch, scoreCatPlayer1, scoreCatPlayer2 });
}

const SCORE_CAT_CELL = 160;
const SCORE_CAT_DISPLAY_SCALE = 0.75;
const SCORE_CAT_ANCHOR = Object.freeze({ x: 0.5, y: 0.9 });
const SCORE_CAT_SHEETS = Object.freeze({
  1: Object.freeze({ identity: "cat-paw-score-cat-p1.png", sha256: "4ff95bc9de2c461a355a27b7a949735e6eaa2d9810d212a41e29ed5f9d8f2121" }),
  2: Object.freeze({ identity: "cat-paw-score-cat-p2.png", sha256: "1282b14991195787f8fbb446f82c100780031bffcf5403f46a4e1ce4d5346928" })
});

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

function makeGoalText(): Text {
  const label = new Text({
    text: "GOAL",
    style: new TextStyle({
      fontFamily: "system-ui, sans-serif",
      fontSize: 20,
      fontWeight: "900",
      fill: COLORS.cream,
      align: "center",
      stroke: { color: COLORS.shadow, width: 5 }
    })
  });
  label.anchor.set(0.5);
  label.eventMode = "none";
  label.roundPixels = true;
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

function asPixiColor(value: string): number {
  return Number.parseInt(value.slice(1), 16);
}

export function createCatHockeyPresenter(options: {
  readonly onEvents?: (events: readonly PresentationEvent[]) => void;
  readonly boardTemplateMode?: boolean;
} = {}): CatHockeyPresenter {
  let initialized = false;
  let destroyed = false;
  let reducedEffects = false;
  let lastEventId = 0;
  let staticRoot: Container;
  let proceduralBoardRoot: Container;
  let foregroundRoot: Container;
  let boardSprite: Sprite;
  let boardTexture: Texture | undefined;
  let defaultBoardTexture: Texture;
  let couchTexture: Texture;
  let board: ValidBoard | undefined;
  let boardReplacementCount = 0;
  let disposedOwnedTextureCount = 0;
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
  let topCat: Sprite;
  let bottomCat: Sprite;
  let scoreCatSheet1: Texture;
  let scoreCatSheet2: Texture;
  let scoreCatFrames1: Texture[] = [];
  let scoreCatFrames2: Texture[] = [];
  let couchTop: NineSliceSprite;
  let couchBottom: NineSliceSprite;
  let goalTop: Graphics;
  let goalBottom: Graphics;
  let goalLabelTop: Text;
  let goalLabelBottom: Text;
  let posts: Graphics;
  let paletteOverlay: Graphics;
  let settingsLabel1: Text;
  let settingsLabel2: Text;
  let themeRoot: Container;
  let themeTexture: Texture | undefined;
  let themeSprites: Partial<Record<ThemeSlot, Sprite>> = {};
  let theme: ValidTheme | undefined;
  let geometryKey = "";
  let goalDiagnostics: Readonly<{ top: GoalDiagnostic; bottom: GoalDiagnostic }> = Object.freeze({
    top: Object.freeze({ openingWidth: RINK.goalRight - RINK.goalLeft, visualWidth: RINK.goalRight - RINK.goalLeft + COUCH_GOAL.visualPadding, labelScale: 1, rotation: Math.PI }),
    bottom: Object.freeze({ openingWidth: RINK.goalRight - RINK.goalLeft, visualWidth: RINK.goalRight - RINK.goalLeft + COUCH_GOAL.visualPadding, labelScale: 1, rotation: 0 })
  });
  const trail: Graphics[] = [];
  const impactPool: Graphics[] = [];
  const activeImpacts: ActiveImpact[] = [];
  const confetti: ConfettiPiece[] = [];
  let shakeEvent: PresentationEvent | undefined;
  let celebrationEvent: PresentationEvent | undefined;
  let lastPresentedState: Readonly<HockeyGameState> | undefined;
  let lastScoreCatFrames: ScoreCatFrames = Object.freeze({ 1: Object.freeze({ frame: 0, reaction: "idle" }), 2: Object.freeze({ frame: 0, reaction: "idle" }) });

  function initialize(layers: SfhsPixiStageLayers): void {
    if (initialized) return;
    if (preparedPresentationImages === undefined) throw new Error("Cat Paw presentation assets were not prepared before renderer startup.");
    staticRoot = new Container({ label: "cat-hockey-static" });
    proceduralBoardRoot = new Container({ label: "cat-hockey-procedural-board" });
    foregroundRoot = new Container({ label: "cat-hockey-board-foreground" });
    actorRoot = new Container({ label: "cat-hockey-actors" });
    effectsRoot = new Container({ label: "cat-hockey-effects" });
    hudRoot = new Container({ label: "cat-hockey-hud" });
    staticRoot.eventMode = "none";
    proceduralBoardRoot.eventMode = "none";
    foregroundRoot.eventMode = "none";
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

    defaultBoardTexture = Texture.from(preparedPresentationImages.board);
    defaultBoardTexture.source.style.scaleMode = "nearest";
    boardSprite = new Sprite(defaultBoardTexture);
    boardSprite.label = "cat-hockey-board-bitmap";
    boardSprite.eventMode = "none";
    boardSprite.position.set(BOARD.x, BOARD.y);
    boardSprite.width = BOARD.width;
    boardSprite.height = BOARD.height;
    boardSprite.roundPixels = true;
    boardSprite.visible = true;
    staticRoot.addChild(proceduralBoardRoot, boardSprite, foregroundRoot);

    const backdrop = new Graphics()
      .rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill({ color: COLORS.table })
      .rect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4).fill({ color: COLORS.felt })
      .rect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4).stroke({ color: COLORS.shadow, width: 4 });
    const markings = new Graphics()
      .rect(RINK.left, RINK.centerY - 2, RINK.right - RINK.left, 4).fill({ color: COLORS.cream, alpha: 0.34 })
      .circle(LOGICAL_CENTER.x, RINK.centerY, 74).stroke({ color: COLORS.cream, width: 5, alpha: 0.3 })
      .circle(LOGICAL_CENTER.x, RINK.centerY, 8).fill({ color: COLORS.cream, alpha: 0.5 });
    for (let i = 0; i < 9; i += 1) {
      const y = RINK.top + 104 + i * 110;
      markings.circle(RINK.left + 12, y, 4).fill({ color: COLORS.cream, alpha: 0.16 });
      markings.circle(RINK.right - 12, y, 4).fill({ color: COLORS.cream, alpha: 0.16 });
    }
    const railDetails = new Graphics();
    for (let y = RINK.top + 22; y < RINK.bottom - 18; y += 62) {
      railDetails.moveTo(5, y).lineTo(15, y + 16).stroke({ color: COLORS.feltLight, width: 2, alpha: 0.18 });
      railDetails.moveTo(LOGICAL_WIDTH - 5, y).lineTo(LOGICAL_WIDTH - 15, y + 16).stroke({ color: COLORS.feltLight, width: 2, alpha: 0.18 });
    }
    couchTexture = Texture.from(preparedPresentationImages.couch);
    couchTexture.source.style.scaleMode = "nearest";
    const couchOptions = { texture: couchTexture, leftWidth: COUCH_GOAL.capWidth, rightWidth: COUCH_GOAL.capWidth, topHeight: COUCH_GOAL.borderHeight, bottomHeight: COUCH_GOAL.borderHeight, width: RINK.goalRight - RINK.goalLeft + COUCH_GOAL.visualPadding, height: COUCH_GOAL.height, anchor: 0.5, roundPixels: true } as const;
    couchTop = new NineSliceSprite(couchOptions);
    couchBottom = new NineSliceSprite(couchOptions);
    couchTop.position.set(LOGICAL_CENTER.x, RINK.top - COUCH_GOAL.height / 2);
    couchBottom.position.set(LOGICAL_CENTER.x, RINK.bottom + COUCH_GOAL.height / 2);
    couchTop.rotation = Math.PI;
    goalTop = new Graphics();
    goalBottom = new Graphics();
    posts = new Graphics();
    paletteOverlay = new Graphics();
    goalLabelTop = makeGoalText();
    goalLabelTop.position.set(LOGICAL_CENTER.x, RINK.top - RINK.goalDepth / 2);
    goalLabelTop.rotation = Math.PI;
    goalLabelBottom = makeGoalText();
    goalLabelBottom.position.set(LOGICAL_CENTER.x, RINK.bottom + RINK.goalDepth / 2);
    proceduralBoardRoot.addChild(backdrop, paletteOverlay, markings, railDetails);
    foregroundRoot.addChild(couchTop, couchBottom, goalTop, goalBottom, posts, goalLabelTop, goalLabelBottom);

    scoreCatSheet1 = Texture.from(preparedPresentationImages.scoreCatPlayer1);
    scoreCatSheet2 = Texture.from(preparedPresentationImages.scoreCatPlayer2);
    scoreCatSheet1.source.style.scaleMode = "nearest";
    scoreCatSheet2.source.style.scaleMode = "nearest";
    scoreCatFrames1 = Array.from({ length: 16 }, (_, index) => new Texture({ source: scoreCatSheet1.source, frame: new Rectangle(index % 4 * SCORE_CAT_CELL, Math.floor(index / 4) * SCORE_CAT_CELL, SCORE_CAT_CELL, SCORE_CAT_CELL) }));
    scoreCatFrames2 = Array.from({ length: 16 }, (_, index) => new Texture({ source: scoreCatSheet2.source, frame: new Rectangle(index % 4 * SCORE_CAT_CELL, Math.floor(index / 4) * SCORE_CAT_CELL, SCORE_CAT_CELL, SCORE_CAT_CELL) }));
    bottomCat = new Sprite(scoreCatFrames1[0]);
    topCat = new Sprite(scoreCatFrames2[0]);
    bottomCat.label = "player-1-score-cat";
    topCat.label = "player-2-score-cat";
    bottomCat.anchor.set(SCORE_CAT_ANCHOR.x, SCORE_CAT_ANCHOR.y);
    topCat.anchor.set(SCORE_CAT_ANCHOR.x, SCORE_CAT_ANCHOR.y);
    bottomCat.scale.set(SCORE_CAT_DISPLAY_SCALE);
    topCat.scale.set(SCORE_CAT_DISPLAY_SCALE);
    bottomCat.roundPixels = true;
    topCat.roundPixels = true;
    bottomCat.eventMode = "none";
    topCat.eventMode = "none";
    bottomCat.position.set(68, RINK.bottom - 34);
    topCat.position.set(LOGICAL_WIDTH - 68, RINK.top + 34);
    topCat.rotation = Math.PI;
    foregroundRoot.addChild(bottomCat, topCat);

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
    score1.position.set(LOGICAL_WIDTH - 68, RINK.bottom - 60);
    score2.position.set(68, RINK.top + 60);
    score2.rotation = Math.PI;
    centerMessage1 = makeText("", 32);
    centerMessage2 = makeText("", 32);
    centerMessage1.position.set(LOGICAL_CENTER.x, RINK.centerY + 46);
    centerMessage2.position.set(LOGICAL_CENTER.x, RINK.centerY - 46);
    centerMessage2.rotation = Math.PI;

    ready1 = new Graphics();
    ready2 = new Graphics();
    readyLabel1 = makeText("HOLD PAW TO READY", 20, COLORS.player1);
    readyLabel2 = makeText("HOLD PAW TO READY", 20, COLORS.player2);
    readyLabel1.position.set(LOGICAL_CENTER.x, RINK.bottom - 40);
    readyLabel2.position.set(LOGICAL_CENTER.x, RINK.top + 40);
    readyLabel2.rotation = Math.PI;
    instruction1 = makeText("PHONE FLAT • ONE CAT EACH END • ONE FINGER", 17, COLORS.cream, "normal");
    instruction2 = makeText("PHONE FLAT • ONE CAT EACH END • ONE FINGER", 17, COLORS.cream, "normal");
    instruction1.position.set(LOGICAL_CENTER.x, RINK.centerY + 120);
    instruction2.position.set(LOGICAL_CENTER.x, RINK.centerY - 120);
    instruction2.rotation = Math.PI;
    settingsLabel1 = makeText("Classic settings", 13, COLORS.cream, "normal");
    settingsLabel2 = makeText("Classic settings", 13, COLORS.cream, "normal");
    settingsLabel1.position.set(LOGICAL_CENTER.x, RINK.centerY + 162);
    settingsLabel2.position.set(LOGICAL_CENTER.x, RINK.centerY - 162);
    settingsLabel2.rotation = Math.PI;
    settingsLabel1.visible = false;
    settingsLabel2.visible = false;
    hudRoot.addChild(score1, score2, centerMessage1, centerMessage2, ready1, ready2, readyLabel1, readyLabel2, instruction1, instruction2, settingsLabel1, settingsLabel2);
    initialized = true;
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
        LOGICAL_CENTER.x + Math.cos(angle) * speed * age,
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
      const settings = state.activeMatchSettings;
      settingsLabel1.text = `P1 · Paw ${settings.pawSpeed[1]}% · Return ${settings.returnSpeed[1]}% · Goal ${settings.goalSize[1]}%`;
      settingsLabel2.text = `P2 · Paw ${settings.pawSpeed[2]}% · Return ${settings.returnSpeed[2]}% · Goal ${settings.goalSize[2]}%`;
    }
  }

  function updateGeometry(state: Readonly<HockeyGameState>): void {
    const top = goalBounds(state.activeMatchSettings, 2);
    const bottom = goalBounds(state.activeMatchSettings, 1);
    const player1 = theme === undefined ? COLORS.player1 : asPixiColor(theme.palette.player1);
    const player2 = theme === undefined ? COLORS.player2 : asPixiColor(theme.palette.player2);
    const railColor = theme === undefined ? COLORS.railDark : asPixiColor(theme.palette.rail);
    const markingColor = theme === undefined ? COLORS.cream : asPixiColor(theme.palette.markings);
    const nextGeometryKey = [top.left, top.right, bottom.left, bottom.right, player1, player2, railColor, markingColor].join(":");
    if (geometryKey === nextGeometryKey) return;
    geometryKey = nextGeometryKey;
    const drawFrame = (graphic: Graphics, goal: Readonly<{ left: number; right: number }>, topGoal: boolean): void => {
      const y = topGoal ? RINK.top - RINK.goalDepth : RINK.bottom;
      const width = goal.right - goal.left;
      graphic.clear()
        .roundRect(goal.left, y, width, RINK.goalDepth, 8).fill({ color: COLORS.shadow, alpha: 0.94 })
        .roundRect(goal.left, y, width, RINK.goalDepth, 8).stroke({ color: COLORS.shadow, width: COUCH_GOAL.outerStroke })
        .roundRect(goal.left, y, width, RINK.goalDepth, 8).stroke({ color: markingColor, width: COUCH_GOAL.innerStroke });
    };
    drawFrame(goalTop, top, true);
    drawFrame(goalBottom, bottom, false);
    const topOpening = top.right - top.left;
    const bottomOpening = bottom.right - bottom.left;
    couchTop.width = topOpening + COUCH_GOAL.visualPadding;
    couchBottom.width = bottomOpening + COUCH_GOAL.visualPadding;
    couchTop.tint = player2;
    couchBottom.tint = player1;
    const topLabelScale = Math.min(1.1, Math.max(0.9, topOpening / (RINK.goalRight - RINK.goalLeft)));
    const bottomLabelScale = Math.min(1.1, Math.max(0.9, bottomOpening / (RINK.goalRight - RINK.goalLeft)));
    goalLabelTop.scale.set(topLabelScale);
    goalLabelBottom.scale.set(bottomLabelScale);
    posts.clear();
    for (const [y, goal] of [[RINK.top, top], [RINK.bottom, bottom]] as const) {
      for (const x of [goal.left, goal.right]) posts.circle(x, y, RINK.postRadius + 5).fill({ color: railColor }).circle(x, y, RINK.postRadius).fill({ color: markingColor });
    }
    goalDiagnostics = Object.freeze({
      top: Object.freeze({ openingWidth: topOpening, visualWidth: couchTop.width, labelScale: topLabelScale, rotation: Math.PI }),
      bottom: Object.freeze({ openingWidth: bottomOpening, visualWidth: couchBottom.width, labelScale: bottomLabelScale, rotation: 0 })
    });
  }

  function updateThemePalette(): void {
    paletteOverlay.clear();
    if (theme === undefined) return;
    const palette = theme.palette;
    paletteOverlay
      .rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill({ color: asPixiColor(palette.table), alpha: 0.2 })
      .rect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4).fill({ color: asPixiColor(palette.felt), alpha: 0.34 })
      .rect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4).stroke({ color: asPixiColor(palette.rail), width: 4, alpha: 0.7 });
    geometryKey = "";
  }

  function applyBoard(): void {
    if (!initialized) return;
    if (boardTexture !== undefined) { boardTexture.destroy(true); disposedOwnedTextureCount += 1; }
    boardTexture = undefined;
    if (board === undefined) {
      boardSprite.texture = defaultBoardTexture;
      boardSprite.width = BOARD.width;
      boardSprite.height = BOARD.height;
      boardSprite.visible = true;
      proceduralBoardRoot.visible = true;
      return;
    }
    boardTexture = Texture.from(board.image);
    boardTexture.source.style.scaleMode = "nearest";
    boardSprite.texture = boardTexture;
    boardSprite.position.set(BOARD.x, BOARD.y);
    boardSprite.width = BOARD.width;
    boardSprite.height = BOARD.height;
    boardSprite.visible = true;
    proceduralBoardRoot.visible = false;
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
    const cells: Readonly<Record<string, number>> = Object.freeze({ paw1: 0, paw2: 1, puck: 2, emblem: 3, impact: 8, confetti: 9, winner: 10, corner: 11 });
    for (const [name, cell] of Object.entries(cells)) {
      if (!theme.slots[name as ThemeSlot]) continue;
      const sprite = new Sprite(new Texture({ source: themeTexture.source, frame: new Rectangle(cell % 4 * 256, Math.floor(cell / 4) * 256, 256, 256) }));
      sprite.anchor.set(0.5); sprite.eventMode = "none"; themeSprites[name as ThemeSlot] = sprite; themeRoot.addChild(sprite);
    }
    themeTexture.source.style.scaleMode = "nearest";
    geometryKey = "";
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
      lastPresentedState = state;
      if (options.boardTemplateMode) {
        proceduralBoardRoot.visible = true;
        boardSprite.visible = false;
        foregroundRoot.visible = false;
        actorRoot.visible = false;
        effectsRoot.visible = false;
        hudRoot.visible = false;
        themeRoot.visible = false;
        layers.worldRoot.position.set(0, 0);
        return;
      }
      foregroundRoot.visible = true;
      actorRoot.visible = true;
      effectsRoot.visible = true;
      hudRoot.visible = true;
      themeRoot.visible = true;
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
      lastScoreCatFrames = resolveScoreCatFrames(state);
      bottomCat.texture = scoreCatFrames1[lastScoreCatFrames[1].frame]!;
      topCat.texture = scoreCatFrames2[lastScoreCatFrames[2].frame]!;
      setThemeSprite("emblem", LOGICAL_CENTER.x, RINK.centerY, 132, 132, state.phase !== "playing");
      setThemeSprite("corner", RINK.left + 30, RINK.centerY, 52, 52);
      setThemeSprite("winner", LOGICAL_CENTER.x, RINK.centerY, 210, 210, state.phase === "won");
      setThemeSprite("impact", state.puck.position.x, state.puck.position.y, 96, 96, activeImpacts.length > 0 && !reducedEffects);
      setThemeSprite("confetti", LOGICAL_CENTER.x, state.winner === 1 ? RINK.top + 126 : RINK.bottom - 126, 190, 190, celebrationEvent !== undefined && !reducedEffects);
      updateHud(state);
      bottomCat.scale.set(SCORE_CAT_DISPLAY_SCALE);
      topCat.scale.set(SCORE_CAT_DISPLAY_SCALE);
      bottomCat.rotation = 0;
      topCat.rotation = Math.PI;
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
    setBoard(value): void { board = value; boardReplacementCount += 1; applyBoard(); },
    getBoardDiagnostics: () => Object.freeze({
      mode: board === undefined ? "default" : "custom",
      spriteCount: 1 as const,
      replacementCount: boardReplacementCount,
      disposedOwnedTextureCount,
      logicalBounds: Object.freeze({ x: BOARD.x, y: BOARD.y, width: BOARD.width, height: BOARD.height }),
      bitmapPixels: Object.freeze({ width: board?.width ?? BOARD.bitmapWidth, height: board?.height ?? BOARD.bitmapHeight }),
      spriteLogicalSize: Object.freeze({ width: initialized ? boardSprite.width : BOARD.width, height: initialized ? boardSprite.height : BOARD.height })
    }),
    getGoalDiagnostics: () => Object.freeze({ architecture: "pixi-nine-slice" as const, textureSampling: "nearest" as const, top: goalDiagnostics.top, bottom: goalDiagnostics.bottom }),
    getPawDiagnostics: () => {
      const settings = lastPresentedState?.activeMatchSettings;
      const bottomScale = settings === undefined ? 1 : strikerRadius(settings, 1) / STRIKER_RADIUS;
      const topScale = settings === undefined ? 1 : strikerRadius(settings, 2) / STRIKER_RADIUS;
      return Object.freeze({
        top: Object.freeze({ nominalDiameter: STRIKER_RADIUS * 2 * topScale, renderedScaleX: initialized ? paw2.scale.x : topScale, renderedScaleY: initialized ? paw2.scale.y : topScale, presentation: themeSprites.paw2 === undefined ? "procedural" as const : "theme" as const }),
        bottom: Object.freeze({ nominalDiameter: STRIKER_RADIUS * 2 * bottomScale, renderedScaleX: initialized ? paw1.scale.x : bottomScale, renderedScaleY: initialized ? paw1.scale.y : bottomScale, presentation: themeSprites.paw1 === undefined ? "procedural" as const : "theme" as const })
      });
    },
    getScoreCatDiagnostics: () => Object.freeze({
      top: Object.freeze({ frame: lastScoreCatFrames[2].frame, reaction: lastScoreCatFrames[2].reaction, sheet: SCORE_CAT_SHEETS[2].identity, sha256: SCORE_CAT_SHEETS[2].sha256, scale: Object.freeze({ x: initialized ? topCat.scale.x : SCORE_CAT_DISPLAY_SCALE, y: initialized ? topCat.scale.y : SCORE_CAT_DISPLAY_SCALE }), anchor: SCORE_CAT_ANCHOR, rotation: initialized ? topCat.rotation : Math.PI }),
      bottom: Object.freeze({ frame: lastScoreCatFrames[1].frame, reaction: lastScoreCatFrames[1].reaction, sheet: SCORE_CAT_SHEETS[1].identity, sha256: SCORE_CAT_SHEETS[1].sha256, scale: Object.freeze({ x: initialized ? bottomCat.scale.x : SCORE_CAT_DISPLAY_SCALE, y: initialized ? bottomCat.scale.y : SCORE_CAT_DISPLAY_SCALE }), anchor: SCORE_CAT_ANCHOR, rotation: initialized ? bottomCat.rotation : 0 })
    }),
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
      boardTexture?.destroy(true);
      defaultBoardTexture?.destroy(true);
      couchTexture?.destroy(true);
      scoreCatFrames1.forEach((texture) => texture.destroy(false));
      scoreCatFrames2.forEach((texture) => texture.destroy(false));
      scoreCatSheet1?.destroy(true);
      scoreCatSheet2?.destroy(true);
    }
  };
}
