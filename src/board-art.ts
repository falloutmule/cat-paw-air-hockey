import { BOARD, LOGICAL_HEIGHT, LOGICAL_WIDTH, RINK } from "./constants.ts";

export const BOARD_COLORS = Object.freeze({ table: "#172331", felt: "#263f4c", rail: "#a97549", railDark: "#5d3d29", cream: "#fff4d6" });

export function drawDefaultBoard(context: OffscreenCanvasRenderingContext2D): void {
  const scale = BOARD.bitmapScale;
  context.save();
  context.scale(scale, scale);
  context.fillStyle = BOARD_COLORS.table;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  context.fillStyle = BOARD_COLORS.railDark;
  context.beginPath(); context.roundRect(18, 20, LOGICAL_WIDTH - 36, LOGICAL_HEIGHT - 40, 34); context.fill();
  context.fillStyle = BOARD_COLORS.rail;
  context.beginPath(); context.roundRect(29, 31, LOGICAL_WIDTH - 58, LOGICAL_HEIGHT - 62, 28); context.fill();
  context.fillStyle = BOARD_COLORS.felt;
  context.beginPath(); context.roundRect(RINK.left - 8, RINK.top - 8, RINK.right - RINK.left + 16, RINK.bottom - RINK.top + 16, 25); context.fill();
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
  for (let index = 0; index < 7; index += 1) {
    const y = RINK.top + 110 + index * 106;
    for (const x of [RINK.left + 22, RINK.right - 22]) { context.beginPath(); context.arc(x, y, 6, 0, Math.PI * 2); context.fill(); }
  }
  context.globalAlpha = 0.18;
  context.lineWidth = 3;
  for (let y = 76; y < 900; y += 52) {
    context.beginPath(); context.moveTo(27, y); context.lineTo(40, y + 20); context.stroke();
    context.beginPath(); context.moveTo(513, y); context.lineTo(500, y + 20); context.stroke();
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
