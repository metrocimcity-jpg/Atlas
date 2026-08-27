import { hashString } from "@/utils/format";
import type { Rect } from "../types";

export function organicPath(
  rect: Rect,
  gap: number,
  radiusRatio: number,
  seed: string,
  ctx: CanvasRenderingContext2D,
): void {
  const inset = Math.max(gap, 1.5);
  const x = rect.x + inset / 2;
  const y = rect.y + inset / 2;
  const w = Math.max(rect.w - inset, 1);
  const h = Math.max(rect.h - inset, 1);
  const radius = Math.min(w, h) * Math.min(Math.max(radiusRatio, 0.05), 0.48);
  const n = hashString(seed);
  const jitter = ((n % 1000) / 1000 - 0.5) * Math.min(w, h) * 0.04;
  const bulgeX = Math.min(w * 0.06, 10) + jitter;
  const bulgeY = Math.min(h * 0.06, 10) - jitter;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.quadraticCurveTo(x + w / 2, y - bulgeY, x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.quadraticCurveTo(x + w + bulgeX, y + h / 2, x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.quadraticCurveTo(x + w / 2, y + h + bulgeY, x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.quadraticCurveTo(x - bulgeX, y + h / 2, x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function roundedRectPath(rect: Rect, gap: number, radiusRatio: number, ctx: CanvasRenderingContext2D): void {
  const inset = Math.max(gap, 1);
  const x = rect.x + inset / 2;
  const y = rect.y + inset / 2;
  const w = Math.max(rect.w - inset, 1);
  const h = Math.max(rect.h - inset, 1);
  const r = Math.min(w, h) * Math.min(Math.max(radiusRatio, 0), 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function hitTestRect(rect: Rect, x: number, y: number, gap: number): boolean {
  const inset = gap / 2;
  return x >= rect.x + inset && y >= rect.y + inset && x <= rect.x + rect.w - inset && y <= rect.y + rect.h - inset;
}
