export function fuzzyScore(query: string, candidate: string): number {
  const q = query.toLowerCase();
  const c = candidate.toLowerCase();
  if (q.length === 0) {
    return 1;
  }
  if (c.includes(q)) {
    return 1 + (q.length / Math.max(c.length, 1)) * 0.5;
  }

  let qi = 0;
  let score = 0;
  let lastMatch = -2;
  for (let ci = 0; ci < c.length && qi < q.length; ci += 1) {
    if (c[ci] === q[qi]) {
      score += ci === lastMatch + 1 ? 2 : 1;
      lastMatch = ci;
      qi += 1;
    }
  }
  if (qi !== q.length) {
    return 0;
  }
  return score / (c.length + q.length);
}
