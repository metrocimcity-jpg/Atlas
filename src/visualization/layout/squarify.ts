import type { Rect } from "../types";

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

function worst(row: number[], length: number): number {
  if (row.length === 0) {
    return Infinity;
  }
  const sum = row.reduce((a, b) => a + b, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);
  const len2 = length * length;
  return Math.max((len2 * max) / (sum * sum), (sum * sum) / (len2 * min));
}

export function squarify<T>(items: WeightedItem<T>[], bounds: Rect): Array<{ item: T; rect: Rect }> {
  const result: Array<{ item: T; rect: Rect }> = [];
  const sorted = [...items].sort((a, b) => b.weight - a.weight);
  const total = sorted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0 || bounds.w <= 0 || bounds.h <= 0) {
    return result;
  }

  const scaled = sorted.map((item) => ({
    item: item.item,
    weight: (item.weight / total) * bounds.w * bounds.h,
  }));

  layout(scaled, { ...bounds }, result);
  return result;
}

function layout<T>(
  items: Array<{ item: T; weight: number }>,
  rect: Rect,
  out: Array<{ item: T; rect: Rect }>,
): void {
  if (items.length === 0) {
    return;
  }
  if (items.length === 1) {
    out.push({ item: items[0].item, rect: { ...rect } });
    return;
  }

  const horizontal = rect.w >= rect.h;
  const length = horizontal ? rect.h : rect.w;
  const row: Array<{ item: T; weight: number }> = [];
  const rowWeights: number[] = [];

  while (items.length > 0) {
    const next = items[0];
    const trial = [...rowWeights, next.weight];
    if (row.length === 0 || worst(trial, length) <= worst(rowWeights, length)) {
      row.push(next);
      rowWeights.push(next.weight);
      items.shift();
    } else {
      break;
    }
  }

  const remaining = placeRow(row, rect, horizontal, out);
  layout(items, remaining, out);
}

function placeRow<T>(
  row: Array<{ item: T; weight: number }>,
  rect: Rect,
  horizontal: boolean,
  out: Array<{ item: T; rect: Rect }>,
): Rect {
  const sum = row.reduce((total, item) => total + item.weight, 0);
  if (horizontal) {
    const width = sum / rect.h;
    let y = rect.y;
    for (const item of row) {
      const height = item.weight / width;
      out.push({ item: item.item, rect: { x: rect.x, y, w: width, h: height } });
      y += height;
    }
    return { x: rect.x + width, y: rect.y, w: rect.w - width, h: rect.h };
  }
  const height = sum / rect.w;
  let x = rect.x;
  for (const item of row) {
    const width = item.weight / height;
    out.push({ item: item.item, rect: { x, y: rect.y, w: width, h: height } });
    x += width;
  }
  return { x: rect.x, y: rect.y + height, w: rect.w, h: rect.h - height };
}
