export function createNodeId(relativePath: string): string {
  return relativePath === "" ? "/" : relativePath;
}

export function parentRelativePath(relativePath: string): string | null {
  if (relativePath === "") {
    return null;
  }
  const separator = relativePath.lastIndexOf("/");
  if (separator <= 0) {
    return "";
  }
  return relativePath.slice(0, separator);
}

export function joinRelativePath(parent: string, name: string): string {
  return parent === "" ? name : `${parent}/${name}`;
}
