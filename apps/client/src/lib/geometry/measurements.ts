import type { Node } from "@/hooks/usePaths";

const WEB_MERCATOR_RADIUS_METERS = 6378137;
const DEGREE_TO_RAD = Math.PI / 180;

function projectLngLatToWebMercator(coords: [number, number]): [number, number] {
  const [lng, lat] = coords;
  const x = WEB_MERCATOR_RADIUS_METERS * lng * DEGREE_TO_RAD;
  const sinLat = Math.sin(lat * DEGREE_TO_RAD);
  const y =
    (WEB_MERCATOR_RADIUS_METERS * Math.log((1 + sinLat) / (1 - sinLat))) / 2;
  return [x, y];
}

function projectNodes(nodes: Node[]): [number, number][] {
  return nodes.map((node) => projectLngLatToWebMercator(node.coords));
}

function computeShoelaceArea(projected: [number, number][]): number {
  const length = projected.length;
  if (length < 3) return 0;
  let area = 0;
  for (let i = 0; i < length; i += 1) {
    const [x1, y1] = projected[i];
    const [x2, y2] = projected[(i + 1) % length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

function computeSegmentLength(
  a: [number, number],
  b: [number, number],
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.hypot(dx, dy);
}

export function computeClosedPathAreaMeters(nodes: Node[]): number {
  if (nodes.length < 3) return 0;
  const projected = projectNodes(nodes);
  return computeShoelaceArea(projected);
}

export function computeOpenPathLengthMeters(nodes: Node[]): number {
  if (nodes.length < 2) return 0;
  const projected = projectNodes(nodes);
  let length = 0;
  for (let i = 0; i < projected.length - 1; i += 1) {
    length += computeSegmentLength(projected[i], projected[i + 1]);
  }
  return length;
}

const areaFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

const lengthFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

export function formatAreaMeters(value: number): string {
  return `${areaFormatter.format(Math.max(0, value))} m²`;
}

export function formatLengthMeters(value: number): string {
  return `${lengthFormatter.format(Math.max(0, value))} m`;
}
