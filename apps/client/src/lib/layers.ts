import { GeoJsonLayer, TextLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { Node, DrawnPath } from "@/hooks/usePaths";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function computeCentroid(nodes: Node[]): [number, number] {
  const lon = nodes.reduce((sum, n) => sum + n.coords[0], 0) / nodes.length;
  const lat = nodes.reduce((sum, n) => sum + n.coords[1], 0) / nodes.length;
  return [lon, lat];
}

// ---------------------------------------------------------------------------
// Drag callbacks type (passed into buildEditNodesLayer from the component,
// since the callbacks close over component refs and state setters)
// ---------------------------------------------------------------------------

export interface EditNodeDragCallbacks {
  onDragStart: (info: PickingInfo) => boolean | void;
  onDrag: (info: PickingInfo) => boolean | void;
  onDragEnd: (info: PickingInfo) => boolean | void;
}

// ---------------------------------------------------------------------------
// Layer builders
// ---------------------------------------------------------------------------

/** ArcGIS background feature data. */
export function buildArcgisLayer(
  geoData: GeoJSON.FeatureCollection | null,
): GeoJsonLayer | null {
  if (!geoData) return null;
  return new GeoJsonLayer({
    id: "arcgis-geojson",
    data: geoData,
    filled: true,
    getFillColor: [100, 149, 237, 80],
    stroked: true,
    getLineColor: [65, 105, 225, 220],
    getLineWidth: 2,
    lineWidthMinPixels: 1,
    getPointRadius: 6,
    pointRadiusMinPixels: 3,
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 210, 0, 150],
  });
}

/** All completed drawn paths (lines and closed polygons). */
export function buildPathsLayer(
  paths: DrawnPath[],
  editingPathId: string | null,
): GeoJsonLayer | null {
  if (paths.length === 0) return null;
  return new GeoJsonLayer({
    id: "drawn-paths",
    data: {
      type: "FeatureCollection" as const,
      features: paths.map((p, i) => ({
        type: "Feature" as const,
        geometry: p.isClosed
          ? ({
              type: "Polygon" as const,
              coordinates: [
                [
                  ...p.nodes.map((n) => [
                    n.coords[0],
                    n.coords[1],
                    n.z + i * 0.5,
                  ]),
                  [p.nodes[0].coords[0], p.nodes[0].coords[1], p.nodes[0].z],
                ],
              ],
            } as GeoJSON.Polygon)
          : ({
              type: "LineString" as const,
              coordinates: p.nodes.map((n) => [
                n.coords[0],
                n.coords[1],
                n.z,
              ]),
            } as GeoJSON.LineString),
        properties: {
          color: p.color,
          width: p.width,
          isClosed: p.isClosed,
          pathId: p.id,
        },
      })),
    },
    filled: true,
    getFillColor: (f: GeoJSON.Feature) => {
      const props = f.properties as { color: string; pathId: string };
      const [r, g, b] = hexToRgb(props.color);
      return [r, g, b, props.pathId === editingPathId ? 80 : 55] as [
        number,
        number,
        number,
        number,
      ];
    },
    stroked: true,
    getLineColor: (f: GeoJSON.Feature) => {
      const props = f.properties as { color: string; pathId: string };
      const [r, g, b] = hexToRgb(props.color);
      return props.pathId === editingPathId
        ? ([r, g, b, 255] as [number, number, number, number])
        : ([r, g, b, 200] as [number, number, number, number]);
    },
    widthUnits: "pixels" as const,
    getLineWidth: (f: GeoJSON.Feature) => {
      const props = f.properties as { width: number; pathId: string };
      const base = props.width ?? 4;
      return props.pathId === editingPathId ? base + 1 : base;
    },
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: !editingPathId,
    highlightColor: [255, 255, 255, 40],
    updateTriggers: {
      getLineColor: [paths.map((p) => p.color), editingPathId],
      getFillColor: [paths.map((p) => p.color), editingPathId],
      getLineWidth: [paths.map((p) => p.width), editingPathId],
    },
  });
}

/** The in-progress path being actively drawn. */
export function buildActivePathLayer(
  activePathDisplayCoords: [number, number][],
  activeColor: string,
  activeWidth: number,
): GeoJsonLayer | null {
  if (activePathDisplayCoords.length < 2) return null;
  return new GeoJsonLayer({
    id: "active-path",
    data: {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: activePathDisplayCoords,
          },
          properties: {},
        },
      ],
    },
    getLineColor: [...hexToRgb(activeColor), 200] as [
      number,
      number,
      number,
      number,
    ],
    widthUnits: "pixels" as const,
    getLineWidth: activeWidth,
    lineWidthMinPixels: 1,
  });
}

/** Dots rendered at each placed node during drawing; first node is styled distinctly. */
export function buildActiveDotsLayer(
  activePath: Node[],
  activeColor: string,
): GeoJsonLayer | null {
  if (activePath.length === 0) return null;
  return new GeoJsonLayer({
    id: "active-dots",
    data: {
      type: "FeatureCollection" as const,
      features: activePath.map((n, i) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: n.coords },
        properties: { isFirst: i === 0 },
      })),
    },
    getFillColor: (f: GeoJSON.Feature) => {
      const [r, g, b] = hexToRgb(activeColor);
      return (f.properties as { isFirst: boolean }).isFirst
        ? ([255, 255, 255] as [number, number, number])
        : ([r, g, b] as [number, number, number]);
    },
    getPointRadius: (f: GeoJSON.Feature) =>
      (f.properties as { isFirst: boolean }).isFirst ? 7 : 5,
    pointRadiusMinPixels: 5,
    filled: true,
    stroked: true,
    getLineColor: (f: GeoJSON.Feature) => {
      const [r, g, b] = hexToRgb(activeColor);
      return (f.properties as { isFirst: boolean }).isFirst
        ? ([r, g, b, 255] as [number, number, number, number])
        : ([255, 255, 255, 180] as [number, number, number, number]);
    },
    getLineWidth: 1.5,
    lineWidthMinPixels: 1,
    updateTriggers: {
      getFillColor: [activeColor, activePath.length],
      getLineColor: [activeColor, activePath.length],
      getPointRadius: [activePath.length],
    },
  });
}

/** Snap indicator ring, shown when hovering near a snappable node. */
export function buildSnapRingLayer(
  isSnapping: boolean,
  hoverCoord: [number, number] | null,
  canSnapClose: boolean,
): GeoJsonLayer | null {
  if (!isSnapping || !hoverCoord || !canSnapClose) return null;
  return new GeoJsonLayer({
    id: "snap-ring",
    data: {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: hoverCoord,
          },
          properties: {},
        },
      ],
    },
    getFillColor: [255, 255, 255, 0],
    getPointRadius: 14,
    pointRadiusMinPixels: 14,
    filled: false,
    stroked: true,
    getLineColor: [255, 255, 255, 220] as [number, number, number, number],
    getLineWidth: 2,
    lineWidthMinPixels: 2,
  });
}

/** Transparent polygon preview shown when the user is about to close a shape. */
export function buildClosingPreviewLayer(
  showClosingPreview: boolean,
  closingPreviewCoords: [number, number][],
  activeColor: string,
): GeoJsonLayer | null {
  if (!showClosingPreview) return null;
  return new GeoJsonLayer({
    id: "closing-preview",
    data: {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [closingPreviewCoords],
          },
          properties: {},
        },
      ],
    },
    filled: true,
    getFillColor: [...hexToRgb(activeColor), 35] as [
      number,
      number,
      number,
      number,
    ],
    stroked: false,
  });
}

/** Ghost line from the last placed node to the cursor position. */
export function buildPreviewLayer(
  isDrawing: boolean,
  previewStartCoord: [number, number] | null,
  hoverCoord: [number, number] | null,
  activeColor: string,
  isSnapping: boolean,
): GeoJsonLayer | null {
  if (!isDrawing || !previewStartCoord || !hoverCoord) return null;
  return new GeoJsonLayer({
    id: "preview-line",
    data: {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: [previewStartCoord, hoverCoord],
          },
          properties: {},
        },
      ],
    },
    getLineColor: [...hexToRgb(activeColor), isSnapping ? 200 : 110] as [
      number,
      number,
      number,
      number,
    ],
    getLineWidth: 3,
    lineWidthMinPixels: 2,
  });
}

/**
 * Edit-mode draggable node dots with multi-selection highlight.
 * Drag callbacks are provided by the component, as they close over component refs.
 */
export function buildEditNodesLayer(
  editingPath: DrawnPath | null,
  selectedNodeIds: Set<string>,
  selectionKey: string,
  dragCallbacks: EditNodeDragCallbacks,
): GeoJsonLayer | null {
  if (!editingPath) return null;
  return new GeoJsonLayer({
    id: "edit-nodes",
    data: {
      type: "FeatureCollection" as const,
      features: editingPath.nodes.map((node) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: node.coords },
        properties: {
          nodeId: node.id,
          isSelected: selectedNodeIds.has(node.id),
        },
      })),
    },
    getFillColor: (f: GeoJSON.Feature) => {
      const { isSelected } = f.properties as { isSelected: boolean };
      if (isSelected)
        return [255, 220, 0, 255] as [number, number, number, number];
      const [r, g, b] = hexToRgb(editingPath.color);
      return [r, g, b, 230] as [number, number, number, number];
    },
    getLineColor: [255, 255, 255, 220] as [number, number, number, number],
    getPointRadius: (f: GeoJSON.Feature) =>
      (f.properties as { isSelected: boolean }).isSelected ? 10 : 7,
    pointRadiusMinPixels: 7,
    filled: true,
    stroked: true,
    getLineWidth: 2,
    lineWidthMinPixels: 1.5,
    pickable: true,
    onDragStart: dragCallbacks.onDragStart,
    onDrag: dragCallbacks.onDrag,
    onDragEnd: dragCallbacks.onDragEnd,
    updateTriggers: {
      getFillColor: [selectionKey, editingPath.color],
      getPointRadius: [selectionKey],
    },
  });
}

/**
 * Text labels rendered at the centroid of each closed polygon area.
 * SDF font enables the outline for contrast against both the transparent fill
 * and underlying map features.
 */
export function buildClosedAreaLabelsLayer(
  paths: DrawnPath[],
): TextLayer | null {
  if (!paths.some((p) => p.isClosed)) return null;
  return new TextLayer({
    id: "closed-area-labels",
    data: paths.filter((p) => p.isClosed),
    getPosition: (p: DrawnPath) => computeCentroid(p.nodes),
    getText: (p: DrawnPath) => p.name,
    getColor: (p: DrawnPath) =>
      [...hexToRgb(p.color), 255] as [number, number, number, number],
    getSize: 13,
    sizeUnits: "pixels" as const,
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontWeight: 600,
    fontSettings: { sdf: true },
    outlineWidth: 3,
    outlineColor: [0, 0, 0, 200] as [number, number, number, number],
    getTextAnchor: "middle" as const,
    getAlignmentBaseline: "center" as const,
    updateTriggers: {
      getPosition: [paths.map((p) => p.nodes)],
      getText: [paths.map((p) => p.name)],
      getColor: [paths.map((p) => p.color)],
    },
  });
}
