import type { FoamTree } from "@carrotsearch/foamtree";

let instance: FoamTree | null = null;

export function setFoamTreeInstance(next: FoamTree | null): void {
  instance = next;
}

export function getFoamTreeInstance(): FoamTree | null {
  return instance;
}

export function resetFoamTreeView(): void {
  void instance?.reset();
}

export function exposeFoamTreeGroup(id: string | null): void {
  if (!instance) {
    return;
  }
  if (id === null || id === "") {
    void instance.expose([]);
    return;
  }
  void instance.expose({ id });
}
