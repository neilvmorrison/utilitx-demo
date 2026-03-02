import type { Node, DrawnPath } from "@/hooks/usePaths";

/**
 * Builds the coordinate array for the active path display.
 * When extending an existing path, prepends that path's last node so the
 * new segment visually originates from it; only 1 new node is then required.
 */
export function computeActivePathDisplayCoords(
  activePath: Node[],
  extendingPath: DrawnPath | null,
): [number, number][] {
  if (extendingPath) {
    return [
      extendingPath.nodes[extendingPath.nodes.length - 1].coords,
      ...activePath.map((n) => n.coords),
    ];
  }
  return activePath.map((n) => n.coords);
}

/**
 * Returns true if the current drawing state allows snapping to close the shape.
 * When extending: needs at least 3 total nodes (existing + new).
 * When drawing new: needs ≥3 nodes to self-close, or ≥2 to connect to another path.
 */
export function computeCanSnapClose(
  activePath: Node[],
  extendingPath: DrawnPath | null,
  snapIsFirstNode: boolean,
): boolean {
  const totalNodesForClose =
    (extendingPath?.nodes.length ?? 0) + activePath.length;
  if (extendingPath) {
    return totalNodesForClose >= 3;
  }
  return activePath.length >= (snapIsFirstNode ? 3 : 2);
}

/**
 * Returns true when the transparent polygon closing-preview should be shown.
 */
export function computeShowClosingPreview(
  isSnapping: boolean,
  hoverCoord: [number, number] | null,
  activePath: Node[],
  extendingPath: DrawnPath | null,
  snapIsFirstNode: boolean,
): boolean {
  if (!isSnapping || !hoverCoord) return false;
  const totalNodesForClose =
    (extendingPath?.nodes.length ?? 0) + activePath.length;
  const rootFirstCoord: [number, number] | null = extendingPath
    ? extendingPath.nodes[0].coords
    : (activePath[0]?.coords ?? null);
  if (rootFirstCoord === null) return false;

  if (extendingPath) {
    return totalNodesForClose >= 3;
  }
  return snapIsFirstNode ? activePath.length >= 3 : activePath.length >= 2;
}

/**
 * Returns the coordinate ring for the closing-preview polygon.
 * Returns an empty array when the preview should not be shown.
 */
export function computeClosingPreviewCoords(
  showClosingPreview: boolean,
  activePath: Node[],
  extendingPath: DrawnPath | null,
  hoverCoord: [number, number] | null,
  snapIsFirstNode: boolean,
): [number, number][] {
  if (!showClosingPreview || !hoverCoord) return [];

  const rootCoords: [number, number][] = extendingPath
    ? [
        ...extendingPath.nodes.map((n) => n.coords),
        ...activePath.map((n) => n.coords),
      ]
    : activePath.map((n) => n.coords);

  const rootFirstCoord: [number, number] | null = extendingPath
    ? extendingPath.nodes[0].coords
    : (activePath[0]?.coords ?? null);

  if (!rootFirstCoord) return [];

  return snapIsFirstNode
    ? [...rootCoords, rootFirstCoord]
    : [...rootCoords, hoverCoord, rootFirstCoord];
}

/**
 * Returns the starting coordinate for the ghost preview line (last placed node,
 * or the extending path's last node if no new nodes have been placed yet).
 */
export function computePreviewStartCoord(
  activePath: Node[],
  extendingPath: DrawnPath | null,
): [number, number] | null {
  if (activePath.length > 0) {
    return activePath[activePath.length - 1].coords;
  }
  if (extendingPath) {
    return extendingPath.nodes[extendingPath.nodes.length - 1].coords;
  }
  return null;
}
