"use client";

import { useState, useEffect, useRef } from "react";
import { DeckGL } from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Map as MapGL } from "react-map-gl/maplibre";
import type { PickingInfo } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const SNAP_RADIUS_PX = 20;

const UTILITY_PRESETS = [
  {
    label: "Electrical / Power",
    color: "#FF0000",
    desc: "Power lines, cables, conduit, lighting",
  },
  {
    label: "Gas / Oil / Steam",
    color: "#FFCC00",
    desc: "Gas, oil, steam, petroleum",
  },
  { label: "Potable Water", color: "#0070C0", desc: "Drinking water" },
  {
    label: "Sewer / Drain",
    color: "#00A550",
    desc: "Sanitary and storm sewer pipes/drains",
  },
  {
    label: "Telecommunications",
    color: "#FF8000",
    desc: "Phone, fiber, alarm, signal lines",
  },
  {
    label: "Reclaimed Water",
    color: "#9900CC",
    desc: "Irrigation and slurry lines",
  },
  {
    label: "Proposed Excavation",
    color: "#FFFFFF",
    desc: "Proposed excavation routes",
  },
  {
    label: "Survey Markings",
    color: "#FF69B4",
    desc: "Temporary survey markings",
  },
] as const;

const INITIAL_VIEW_STATE = {
  longitude: -79.3874715594294,
  latitude: 43.64118809154064,
  zoom: 14,
  pitch: 30,
  bearing: 0,
};

type Node = {
  id: string;
  name: string;
  coords: [number, number];
  z: number;
};

type DrawnPath = {
  id: string;
  name: string;
  nodes: Node[];
  color: string;
  width: number;
  isClosed: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

interface DeckMapProps {
  geoData: GeoJSON.FeatureCollection | null;
}

export default function DeckMap({ geoData }: DeckMapProps) {
  // Drawing state
  const [paths, setPaths] = useState<DrawnPath[]>([]);
  const [activePath, setActivePath] = useState<Node[]>([]);
  const [hoverCoord, setHoverCoord] = useState<[number, number] | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  // When isSnapping, tracks whether we're snapping to the first node of the
  // active path (→ self-close polygon) or to a node on a completed path (→ connect).
  const [snapIsFirstNode, setSnapIsFirstNode] = useState(false);
  const [activeColor, setActiveColor] = useState("#ff4a55");
  const [activeWidth, setActiveWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pathName, setPathName] = useState("");
  const [pathCount, setPathCount] = useState(1);
  const [expandedPathId, setExpandedPathId] = useState<string | null>(null);
  const [presetOpen, setPresetOpen] = useState(false);

  // Edit mode state — Set for multi-selection
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDraggingNode, setIsDraggingNode] = useState(false);

  // Refs for stable access inside drag/keyboard callbacks
  const editingPathIdRef = useRef<string | null>(null);
  const selectedNodeIdsRef = useRef<Set<string>>(new Set());
  const isDrawingRef = useRef(false);
  const pathsRef = useRef<DrawnPath[]>([]);
  // Drag state refs — updated synchronously at drag start, read during onDrag
  const dragStartCoordRef = useRef<[number, number] | null>(null);
  const dragStartNodeCoordsRef = useRef<Map<string, [number, number]>>(
    new Map(),
  );

  editingPathIdRef.current = editingPathId;
  selectedNodeIdsRef.current = selectedNodeIds;
  isDrawingRef.current = isDrawing;
  pathsRef.current = paths;

  // Clear editingPathId if the path was deleted elsewhere
  useEffect(() => {
    if (editingPathId && !paths.find((p) => p.id === editingPathId)) {
      setEditingPathId(null);
      setSelectedNodeIds(new Set());
    }
  }, [paths, editingPathId]);

  // Keyboard: Escape deactivates; Delete/Backspace removes all selected nodes
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isDrawingRef.current) {
          setIsDrawing(false);
          setActivePath([]);
          setHoverCoord(null);
          setIsSnapping(false);
          setSnapIsFirstNode(false);
        } else {
          setEditingPathId(null);
          setSelectedNodeIds(new Set());
        }
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        const nodeIds = selectedNodeIdsRef.current;
        const pathId = editingPathIdRef.current;
        if (nodeIds.size === 0 || !pathId) return;
        setPaths((prev) => {
          const path = prev.find((p) => p.id === pathId);
          if (!path) return prev;
          const newNodes = path.nodes.filter((n) => !nodeIds.has(n.id));
          if (newNodes.length < 2) return prev.filter((p) => p.id !== pathId);
          const isClosed = path.isClosed && newNodes.length >= 3;
          return prev.map((p) =>
            p.id === pathId ? { ...p, nodes: newNodes, isClosed } : p,
          );
        });
        setSelectedNodeIds(new Set());
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const editingPath = paths.find((p) => p.id === editingPathId) ?? null;
  // Stable key for updateTriggers — avoid creating a new array reference every render
  const selectionKey = [...selectedNodeIds].sort().join(",");

  // --- Layers ---

  const arcgisLayer = geoData
    ? new GeoJsonLayer({
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
      })
    : null;

  // Completed paths — pixel-width so the width control has an immediate visual effect
  const pathsLayer =
    paths.length > 0
      ? new GeoJsonLayer({
          id: "drawn-paths",
          data: {
            type: "FeatureCollection" as const,
            features: paths.map((p) => ({
              type: "Feature" as const,
              geometry: p.isClosed
                ? ({
                    type: "Polygon" as const,
                    coordinates: [
                      [
                        ...p.nodes.map((n) => [n.coords[0], n.coords[1], n.z]),
                        [
                          p.nodes[0].coords[0],
                          p.nodes[0].coords[1],
                          p.nodes[0].z,
                        ],
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
        })
      : null;

  // In-progress path being drawn
  const activePathLayer =
    activePath.length >= 2
      ? new GeoJsonLayer({
          id: "active-path",
          data: {
            type: "FeatureCollection" as const,
            features: [
              {
                type: "Feature" as const,
                geometry: {
                  type: "LineString" as const,
                  coordinates: activePath.map((n) => n.coords),
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
        })
      : null;

  // Dots at each placed node during drawing; first node styled distinctly
  const activeDotsLayer =
    activePath.length > 0
      ? new GeoJsonLayer({
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
        })
      : null;

  // Snap ring — shown whenever isSnapping, centred on hoverCoord (the snap target)
  const snapRingLayer =
    isSnapping && hoverCoord && activePath.length >= (snapIsFirstNode ? 3 : 2)
      ? new GeoJsonLayer({
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
          getLineColor: [255, 255, 255, 220] as [
            number,
            number,
            number,
            number,
          ],
          getLineWidth: 2,
          lineWidthMinPixels: 2,
        })
      : null;

  // Transparent fill preview when snapping to close or connect.
  // For first-node snap: polygon loops back through activePath[0].
  // For completed-path-node snap: polygon includes hoverCoord then closes to activePath[0].
  const showClosingPreview =
    isSnapping &&
    hoverCoord &&
    (snapIsFirstNode ? activePath.length >= 3 : activePath.length >= 2);
  const closingPreviewCoords: [number, number][] = showClosingPreview
    ? snapIsFirstNode
      ? [...activePath.map((n) => n.coords), activePath[0].coords]
      : [...activePath.map((n) => n.coords), hoverCoord, activePath[0].coords]
    : [];
  const closingPreviewLayer = showClosingPreview
    ? new GeoJsonLayer({
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
        })
      : null;

  // Ghost line from last placed node to cursor
  const previewLayer =
    isDrawing && activePath.length > 0 && hoverCoord
      ? new GeoJsonLayer({
          id: "preview-line",
          data: {
            type: "FeatureCollection" as const,
            features: [
              {
                type: "Feature" as const,
                geometry: {
                  type: "LineString" as const,
                  coordinates: [
                    activePath[activePath.length - 1].coords,
                    hoverCoord,
                  ],
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
        })
      : null;

  // Edit mode: nodes shown as pickable, draggable dots with multi-selection highlight
  const editNodesLayer = editingPath
    ? new GeoJsonLayer({
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
        // onDragStart captures which nodes to drag.
        // If the dragged node is in the selection → move all selected nodes together.
        // If not → move only that node (selection is managed separately via clicks).
        // Returning true stops the event reaching the map controller (prevents map pan).
        onDragStart: (info: PickingInfo) => {
          if (!info.object || !info.coordinate) return;
          const nodeId = (info.object.properties as { nodeId: string }).nodeId;
          const currentSelected = selectedNodeIdsRef.current;

          const nodesToDrag: Set<string> = currentSelected.has(nodeId)
            ? new Set(currentSelected)
            : new Set([nodeId]);

          dragStartCoordRef.current = info.coordinate as [number, number];

          // Snapshot starting positions for all nodes being dragged
          const editPath = pathsRef.current.find(
            (p) => p.id === editingPathIdRef.current,
          );
          const startCoords = new Map<string, [number, number]>();
          if (editPath) {
            for (const n of editPath.nodes) {
              if (nodesToDrag.has(n.id)) {
                startCoords.set(n.id, [n.coords[0], n.coords[1]]);
              }
            }
          }
          dragStartNodeCoordsRef.current = startCoords;

          setIsDraggingNode(true);
          return true;
        },
        onDrag: (info: PickingInfo) => {
          const pathId = editingPathIdRef.current;
          const startCoord = dragStartCoordRef.current;
          if (!pathId || !startCoord || !info.coordinate) return true;

          const [cx, cy] = info.coordinate as [number, number];
          const dx = cx - startCoord[0];
          const dy = cy - startCoord[1];
          const startNodeCoords = dragStartNodeCoordsRef.current;

          setPaths((prev) =>
            prev.map((p) => {
              if (p.id !== pathId) return p;
              return {
                ...p,
                nodes: p.nodes.map((n) => {
                  const start = startNodeCoords.get(n.id);
                  if (!start) return n;
                  return {
                    ...n,
                    coords: [start[0] + dx, start[1] + dy] as [number, number],
                  };
                }),
              };
            }),
          );
          return true;
        },
        onDragEnd: () => {
          dragStartCoordRef.current = null;
          dragStartNodeCoordsRef.current = new Map();
          setIsDraggingNode(false);
          return true;
        },
        updateTriggers: {
          getFillColor: [selectionKey, editingPath.color],
          getPointRadius: [selectionKey],
        },
      })
    : null;

  const layers = [
    arcgisLayer,
    pathsLayer,
    closingPreviewLayer,
    activePathLayer,
    activeDotsLayer,
    snapRingLayer,
    previewLayer,
    editNodesLayer,
  ].filter((l): l is NonNullable<typeof l> => l !== null);

  // --- Handlers ---

  function handleClick(info: PickingInfo, event?: { srcEvent?: MouseEvent }) {
    if (isDrawing) {
      if (isSnapping && hoverCoord) {
        if (snapIsFirstNode && activePath.length >= 3) {
          // Self-close: loop back to first node, forming a polygon
          finishPath(true);
        } else if (activePath.length >= 1) {
          // Connect to a node on an existing path — add snap coord as final node,
          // then close as polygon if there will be ≥3 nodes total
          finishPathAtCoord(hoverCoord);
        }
        return;
      }
      const coord = info.coordinate as [number, number] | undefined;
      if (!coord) return;
      setActivePath((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: `Node ${prev.length + 1}`,
          coords: coord,
          z: 0,
        },
      ]);
      return;
    }

    // Edit mode: click on a node — shift toggles, plain click replaces selection
    if (info.layer?.id === "edit-nodes") {
      if (info.object) {
        const nodeId = (info.object.properties as { nodeId: string }).nodeId;
        const isShift = event?.srcEvent?.shiftKey ?? false;
        setSelectedNodeIds((prev) => {
          if (isShift) {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
          }
          // Plain click: if only this node was selected, deselect; otherwise select it alone
          return prev.size === 1 && prev.has(nodeId)
            ? new Set()
            : new Set([nodeId]);
        });
        // Reset drag state in case onDragStart fired without a real drag
        setIsDraggingNode(false);
      }
      return;
    }

    // Click on a completed path: activate it for node editing
    if (info.layer?.id === "drawn-paths") {
      if (info.object) {
        const pathId = (info.object.properties as { pathId: string }).pathId;
        if (pathId) {
          setEditingPathId(pathId);
          setSelectedNodeIds(new Set());
        }
      }
      return;
    }

    // Click on empty map: clear selection, keep path active
    setSelectedNodeIds(new Set());
  }

  function handleHover(info: PickingInfo) {
    if (!isDrawing) return;
    const coord = info.coordinate as [number, number] | undefined;
    if (!coord) return;

    if (info.viewport) {
      const cx = info.x ?? 0;
      const cy = info.y ?? 0;

      // Priority 1: snap to first node of active path to self-close as polygon
      if (activePath.length >= 3) {
        const [px, py] = info.viewport.project([
          activePath[0].coords[0],
          activePath[0].coords[1],
        ]);
        if (Math.sqrt((cx - px) ** 2 + (cy - py) ** 2) < SNAP_RADIUS_PX) {
          setIsSnapping(true);
          setSnapIsFirstNode(true);
          setHoverCoord(activePath[0].coords);
          return;
        }
      }

      // Priority 2: snap to any node on a completed path to connect and close
      for (const path of paths) {
        for (const node of path.nodes) {
          const [px, py] = info.viewport.project([
            node.coords[0],
            node.coords[1],
          ]);
          if (Math.sqrt((cx - px) ** 2 + (cy - py) ** 2) < SNAP_RADIUS_PX) {
            setIsSnapping(true);
            setSnapIsFirstNode(false);
            setHoverCoord(node.coords);
            return;
          }
        }
      }
    }

    setIsSnapping(false);
    setSnapIsFirstNode(false);
    setHoverCoord(coord);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    if (isDrawing) {
      cancelDrawing();
    } else if (editingPathId) {
      setEditingPathId(null);
      setSelectedNodeIds(new Set());
    }
  }

  function startDrawing() {
    setIsDrawing(true);
    setEditingPathId(null);
    setSelectedNodeIds(new Set());
  }

  function cancelDrawing() {
    setIsDrawing(false);
    setActivePath([]);
    setHoverCoord(null);
    setIsSnapping(false);
    setSnapIsFirstNode(false);
  }

  function finishPath(closed = false) {
    if (activePath.length < 2) return;
    const name = pathName.trim() || `Path ${pathCount}`;
    setPaths((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        nodes: activePath,
        color: activeColor,
        width: activeWidth,
        isClosed: closed,
      },
    ]);
    setPathCount((n) => n + 1);
    setPathName("");
    setActivePath([]);
    setIsDrawing(false);
    setHoverCoord(null);
    setIsSnapping(false);
  }

  function finishPathAtCoord(coord: [number, number]) {
    const extraNode: Node = {
      id: crypto.randomUUID(),
      name: `Node ${activePath.length + 1}`,
      coords: coord,
      z: 0,
    };
    const nodes = [...activePath, extraNode];
    if (nodes.length < 2) return;
    const name = pathName.trim() || `Path ${pathCount}`;
    const isClosed = nodes.length >= 3;
    setPaths((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        nodes,
        color: activeColor,
        width: activeWidth,
        isClosed,
      },
    ]);
    setPathCount((n) => n + 1);
    setPathName("");
    setActivePath([]);
    setIsDrawing(false);
    setHoverCoord(null);
    setIsSnapping(false);
    setSnapIsFirstNode(false);
  }

  function updatePathName(id: string, name: string) {
    setPaths((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function updatePathColor(id: string, color: string) {
    setPaths((prev) => prev.map((p) => (p.id === id ? { ...p, color } : p)));
  }

  function updatePathWidth(id: string, width: number) {
    const clamped = Math.max(1, Math.min(20, width));
    setPaths((prev) =>
      prev.map((p) => (p.id === id ? { ...p, width: clamped } : p)),
    );
  }

  function updateNodeName(pathId: string, nodeId: string, name: string) {
    setPaths((prev) =>
      prev.map((p) =>
        p.id !== pathId
          ? p
          : {
              ...p,
              nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, name } : n)),
            },
      ),
    );
  }

  function updateNodeZ(pathId: string, nodeId: string, z: number) {
    setPaths((prev) =>
      prev.map((p) =>
        p.id !== pathId
          ? p
          : {
              ...p,
              nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, z } : n)),
            },
      ),
    );
  }

  function deletePath(id: string) {
    setPaths((prev) => prev.filter((p) => p.id !== id));
    if (expandedPathId === id) setExpandedPathId(null);
    if (editingPathId === id) {
      setEditingPathId(null);
      setSelectedNodeIds(new Set());
    }
  }

  function toggleExpand(id: string) {
    setExpandedPathId((prev) => (prev === id ? null : id));
  }

  // --- Render ---

  const numInputStyle: React.CSSProperties = {
    width: 44,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid #2a2e3d",
    borderRadius: 4,
    color: "#ddd",
    fontSize: 11,
    padding: "2px 4px",
    outline: "none",
    fontFamily: "monospace",
  };

  const ghostInputStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid transparent",
    color: "#ddd",
    padding: "1px 2px",
    outline: "none",
    cursor: "text",
  };

  const selCount = selectedNodeIds.size;

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      onContextMenu={handleContextMenu}
    >
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={!isDraggingNode}
        layers={layers}
        onClick={handleClick as (info: PickingInfo) => void}
        onHover={handleHover}
        getCursor={({ isDragging }) =>
          isDraggingNode || isDragging
            ? "grabbing"
            : isDrawing
              ? "crosshair"
              : "grab"
        }
        style={{ position: "absolute", inset: "0" }}
      >
        <MapGL mapStyle={MAP_STYLE} />
      </DeckGL>

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 268,
          background: "rgba(10, 14, 22, 0.88)",
          borderRadius: 10,
          padding: "14px 14px",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 13,
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          zIndex: 10,
          userSelect: "none",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
          Line Paths
        </div>

        {/* Edit mode status bar */}
        {editingPathId && !isDrawing && (
          <div
            style={{
              marginBottom: 8,
              padding: "6px 9px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 5,
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 11,
              color: "#bbb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              Editing:{" "}
              <strong style={{ color: "#fff" }}>
                {paths.find((p) => p.id === editingPathId)?.name ?? ""}
              </strong>
              {selCount > 0 && (
                <span style={{ color: "#ffd900" }}>
                  {" "}
                  · {selCount} node{selCount !== 1 ? "s" : ""}
                </span>
              )}
            </span>
            <button
              onClick={() => {
                setEditingPathId(null);
                setSelectedNodeIds(new Set());
              }}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                padding: "0 2px",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Edit mode hints */}
        {editingPathId && !isDrawing && (
          <div
            style={{
              marginBottom: 10,
              fontSize: 10,
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            {selCount > 1
              ? "Drag any selected node to move all · Del to delete · Shift+click to adjust"
              : selCount === 1
                ? "Drag to move · Del to remove · Shift+click to add to selection"
                : "Click node to select · Shift+click multi-select · Drag to move · Esc to exit"}
          </div>
        )}

        {/* Name for next path */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 10,
          }}
        >
          <span style={{ color: "#999", fontSize: 11 }}>Name</span>
          <input
            type="text"
            value={pathName}
            onChange={(e) => setPathName(e.target.value)}
            placeholder={`Path ${pathCount}`}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid #2a2e3d",
              borderRadius: 5,
              color: "#ddd",
              fontSize: 13,
              padding: "5px 8px",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </label>

        {/* Utility type preset dropdown */}
        <div style={{ marginBottom: 10, position: "relative" }}>
          <span
            style={{
              color: "#999",
              fontSize: 11,
              display: "block",
              marginBottom: 4,
            }}
          >
            Type
          </span>
          <button
            onClick={() => setPresetOpen((v) => !v)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 8px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid #2a2e3d",
              borderRadius: 5,
              color: "#ddd",
              cursor: "pointer",
              fontSize: 12,
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 13,
                height: 13,
                borderRadius: 3,
                flexShrink: 0,
                background: activeColor,
                border:
                  activeColor.toLowerCase() === "#ffffff"
                    ? "1px solid #666"
                    : "none",
                display: "inline-block",
              }}
            />
            <span style={{ flex: 1 }}>
              {UTILITY_PRESETS.find(
                (p) => p.color.toLowerCase() === activeColor.toLowerCase(),
              )?.label ?? "Custom"}
            </span>
            <span style={{ color: "#555", fontSize: 10 }}>
              {presetOpen ? "▲" : "▾"}
            </span>
          </button>

          {presetOpen && (
            <>
              <div
                onClick={() => setPresetOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 19 }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  background: "rgba(8, 12, 22, 0.98)",
                  border: "1px solid #2a2e3d",
                  borderRadius: 6,
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.7)",
                }}
              >
                {UTILITY_PRESETS.map((preset) => (
                  <div
                    key={preset.color}
                    onClick={() => {
                      setActiveColor(preset.color);
                      setPresetOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "7px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#ccc",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 3,
                        flexShrink: 0,
                        background: preset.color,
                        display: "inline-block",
                        border:
                          preset.color === "#FFFFFF"
                            ? "1px solid #555"
                            : "none",
                      }}
                    />
                    <span>{preset.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Color + Width row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <label
            style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}
          >
            <span style={{ color: "#999", fontSize: 11 }}>Color</span>
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              style={{
                width: 28,
                height: 22,
                border: "1px solid #333",
                borderRadius: 4,
                background: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
            <span
              style={{ color: "#777", fontFamily: "monospace", fontSize: 11 }}
            >
              {activeColor}
            </span>
          </label>
        </div>

        {/* Width slider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span style={{ color: "#999", fontSize: 11, flexShrink: 0 }}>
            Width
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={activeWidth}
            onChange={(e) => setActiveWidth(Number(e.target.value))}
            style={{ flex: 1, accentColor: activeColor }}
          />
          <span
            style={{
              color: "#777",
              fontFamily: "monospace",
              fontSize: 11,
              width: 28,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {activeWidth}px
          </span>
        </div>

        {/* Action buttons */}
        {!isDrawing ? (
          <button
            onClick={startDrawing}
            style={{
              width: "100%",
              padding: "8px 0",
              borderRadius: 6,
              border: "none",
              background: "#1e5fa8",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            New Path
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {activePath.length >= 2 && (
                <button
                  onClick={() => finishPath(false)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 6,
                    border: "none",
                    background: "#1a7a3c",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Finish Path
                </button>
              )}
              <button
                onClick={cancelDrawing}
                style={{
                  flex: activePath.length >= 2 ? undefined : 1,
                  width: activePath.length >= 2 ? undefined : "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "#9b2335",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                padding: "5px 8px",
                borderRadius: 4,
                background: isSnapping
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.05)",
                color: isSnapping ? "#fff" : "#aaa",
                transition: "background 0.1s",
              }}
            >
              {isSnapping
                ? snapIsFirstNode
                  ? "Click to close area"
                  : "Click to connect & close"
                : activePath.length === 0
                  ? "Click to place first node"
                  : `${activePath.length} node${activePath.length !== 1 ? "s" : ""} — click to extend`}
            </div>
          </div>
        )}

        {/* Paths list */}
        {paths.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                color: "#555",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 8,
                borderTop: "1px solid #1e2230",
                paddingTop: 12,
              }}
            >
              {paths.length} path{paths.length !== 1 ? "s" : ""}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {paths.map((path) => (
                <div
                  key={path.id}
                  style={{
                    background:
                      path.id === editingPathId
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.04)",
                    borderRadius: 6,
                    padding: "7px 8px",
                    border:
                      path.id === editingPathId
                        ? "1px solid rgba(255,255,255,0.15)"
                        : "1px solid transparent",
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <button
                      onClick={() => toggleExpand(path.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#555",
                        cursor: "pointer",
                        fontSize: 9,
                        padding: 0,
                        lineHeight: 1,
                        flexShrink: 0,
                        width: 12,
                      }}
                    >
                      {expandedPathId === path.id ? "▼" : "▶"}
                    </button>
                    <input
                      type="text"
                      value={path.name}
                      onChange={(e) => updatePathName(path.id, e.target.value)}
                      style={{
                        ...ghostInputStyle,
                        flex: 1,
                        fontSize: 12,
                        minWidth: 0,
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderBottomColor = "#3a7bd5")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderBottomColor =
                          "transparent")
                      }
                    />
                    {path.isClosed && (
                      <span
                        style={{
                          fontSize: 9,
                          color: "#5a9",
                          background: "rgba(90,170,100,0.15)",
                          border: "1px solid rgba(90,170,100,0.3)",
                          borderRadius: 3,
                          padding: "1px 4px",
                          flexShrink: 0,
                        }}
                      >
                        area
                      </span>
                    )}
                    <input
                      type="color"
                      value={path.color}
                      onChange={(e) => updatePathColor(path.id, e.target.value)}
                      style={{
                        width: 20,
                        height: 20,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        padding: 0,
                        flexShrink: 0,
                      }}
                      title="Change color"
                    />
                    <button
                      onClick={() => deletePath(path.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#555",
                        cursor: "pointer",
                        fontSize: 18,
                        lineHeight: 1,
                        padding: "0 2px",
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Width row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 5,
                      paddingLeft: 16,
                    }}
                  >
                    <span style={{ color: "#555", fontSize: 10 }}>W</span>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={path.width}
                      onChange={(e) =>
                        updatePathWidth(path.id, Number(e.target.value))
                      }
                      style={{ flex: 1, accentColor: path.color }}
                    />
                    <span
                      style={{
                        color: "#666",
                        fontFamily: "monospace",
                        fontSize: 10,
                        width: 24,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {path.width}px
                    </span>
                  </div>

                  {/* Collapsed: node count */}
                  {expandedPathId !== path.id && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#444",
                        marginTop: 3,
                        paddingLeft: 16,
                      }}
                    >
                      {path.nodes.length} node
                      {path.nodes.length !== 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Expanded: per-node name + z */}
                  {expandedPathId === path.id && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingLeft: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      {path.nodes.map((node, i) => (
                        <div
                          key={node.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              color: i === 0 ? "#fff" : "#3a7bd5",
                              fontSize: 7,
                              flexShrink: 0,
                            }}
                          >
                            ●
                          </span>
                          <input
                            type="text"
                            value={node.name}
                            onChange={(e) =>
                              updateNodeName(path.id, node.id, e.target.value)
                            }
                            style={{
                              ...ghostInputStyle,
                              fontSize: 11,
                              color: "#bbb",
                              width: 80,
                              flexShrink: 0,
                            }}
                            onFocus={(e) =>
                              (e.currentTarget.style.borderBottomColor =
                                "#3a7bd5")
                            }
                            onBlur={(e) =>
                              (e.currentTarget.style.borderBottomColor =
                                "transparent")
                            }
                          />
                          <span style={{ color: "#555", fontSize: 11 }}>Z</span>
                          <input
                            type="number"
                            value={node.z}
                            step={1}
                            onChange={(e) =>
                              updateNodeZ(
                                path.id,
                                node.id,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            style={numInputStyle}
                          />
                          <span style={{ color: "#444", fontSize: 11 }}>m</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
