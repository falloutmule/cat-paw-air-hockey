import { BOARD, LOGICAL_HEIGHT, LOGICAL_WIDTH, RINK } from "./constants.ts";

export const BOARD_COLORS = Object.freeze({ table: "#172331", felt: "#263f4c", feltLight: "#315464", edge: "#071018", cream: "#fff4d6" });

export function drawDefaultBoard(context: OffscreenCanvasRenderingContext2D): void {
  const scale = BOARD.bitmapScale;
  context.save();
  context.scale(scale, scale);
  context.fillStyle = BOARD_COLORS.table;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  context.fillStyle = BOARD_COLORS.felt;
  context.fillRect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4);
  context.strokeStyle = BOARD_COLORS.edge;
  context.lineWidth = 4;
  context.strokeRect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4);
  context.fillStyle = BOARD_COLORS.cream;
  context.globalAlpha = 0.34;
  context.fillRect(RINK.left, RINK.centerY - 2, RINK.right - RINK.left, 4);
  context.globalAlpha = 0.3;
  context.lineWidth = 5;
  context.strokeStyle = BOARD_COLORS.cream;
  context.beginPath(); context.arc(LOGICAL_WIDTH / 2, RINK.centerY, 74, 0, Math.PI * 2); context.stroke();
  context.globalAlpha = 0.5;
  context.beginPath(); context.arc(LOGICAL_WIDTH / 2, RINK.centerY, 8, 0, Math.PI * 2); context.fill();
  context.globalAlpha = 0.16;
  for (let index = 0; index < 9; index += 1) {
    const y = RINK.top + 104 + index * 110;
    for (const x of [RINK.left + 12, RINK.right - 12]) { context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill(); }
  }
  context.globalAlpha = 0.18;
  context.strokeStyle = BOARD_COLORS.feltLight;
  context.lineWidth = 2;
  for (let y = RINK.top + 22; y < RINK.bottom - 18; y += 62) {
    context.beginPath(); context.moveTo(5, y); context.lineTo(15, y + 16); context.stroke();
    context.beginPath(); context.moveTo(LOGICAL_WIDTH - 5, y); context.lineTo(LOGICAL_WIDTH - 15, y + 16); context.stroke();
  }
  context.restore();
}

export async function makeBoardTemplateBlob(): Promise<Blob> {
  const canvas = new OffscreenCanvas(BOARD.bitmapWidth, BOARD.bitmapHeight);
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Board template generation is unavailable.");
  drawDefaultBoard(context);
  return canvas.convertToBlob({ type: "image/png" });
}
