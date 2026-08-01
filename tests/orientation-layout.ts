import { LOGICAL_HEIGHT, LOGICAL_WIDTH, RINK, STRIKER_RADIUS } from "../src/constants.ts";

interface Evaluation { orientation: "portrait" | "landscape"; width: number; height: number; endToEndDepth: number; legalHalfDepth: number; centerClearance: number; goalScreenWidth: number; scoreBandPixels: number; assessment: string[] }
function evaluate(width: number, height: number): Evaluation {
  const portrait = height >= width;
  const scale = Math.min(width / LOGICAL_WIDTH, height / LOGICAL_HEIGHT);
  const endToEndDepth = LOGICAL_HEIGHT * scale;
  const legalHalfDepth = (RINK.centerY - RINK.top - STRIKER_RADIUS * 2 - 11) * scale;
  const centerClearance = (RINK.centerY - (RINK.top + 132) - STRIKER_RADIUS) * scale;
  const goalScreenWidth = (RINK.goalRight - RINK.goalLeft) * scale;
  const scoreBandPixels = 90 * scale;
  const assessment = [
    portrait ? "Full-height rink uses the long phone axis between players." : "Contained portrait rink leaves large side bars and shortens the physical control depth.",
    legalHalfDepth >= 145 ? "Each player has a broad fore-aft swipe range." : "Each player's fore-aft swipe range is cramped.",
    centerClearance >= 95 ? "Hands can remain near their edge without covering the center contest." : "Normal hand placement is more likely to crowd the center.",
    goalScreenWidth >= 72 ? "Goal remains visually readable." : "Goal becomes visually narrow."
  ];
  return { orientation: portrait ? "portrait" : "landscape", width, height, endToEndDepth, legalHalfDepth, centerClearance, goalScreenWidth, scoreBandPixels, assessment };
}
const portrait = evaluate(412, 915);
const landscape = evaluate(915, 412);
const selected = portrait.legalHalfDepth > landscape.legalHalfDepth && portrait.centerClearance > landscape.centerClearance ? "portrait" : "landscape";
console.log(JSON.stringify({ schema: "cat-air-hockey.orientation-comparison@1", testedViewports: { portrait, landscape }, selected, fingerOffsetLogicalPixels: 0, rationale: "Portrait preserves the long phone axis between opposite players, more legal swipe depth, and more separation from the center. A zero offset keeps the paw physically attached to the finger; the halo and high-contrast shape provide visibility." }, null, 2));
