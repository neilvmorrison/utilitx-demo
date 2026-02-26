"use client";

import { useState, useEffect, useRef } from "react";
import { useKeyboardListener } from "@/hooks/useKeyboardListener";
import { usePaths } from "@/hooks/usePaths";
import type { Node } from "@/hooks/usePaths";
import { DeckGL } from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl/maplibre";
import type { PickingInfo } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  buildArcgisLayer,
  buildPathsLayer,
  buildActivePathLayer,
  buildActiveDotsLayer,
  buildSnapRingLayer,
  buildClosingPreviewLayer,
  buildPreviewLayer,
  buildEditNodesLayer,
  buildClosedAreaLabelsLayer,
  type EditNodeDragCallbacks,
} from "@/lib/layers";
import {
  computeActivePathDisplayCoords,
  computeCanSnapClose,
  computeShowClosingPreview,
  computeClosingPreviewCoords,
  computePreviewStartCoord,
} from "@/lib/drawingGeometry";
import MapPanel from "./MapPanel";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const SNAP_RADIUS_PX = 20;

const INITIAL_VIEW_STATE = {
  longitude: -79.3874715594294,
  latitude: 43.64118809154064,
  zoom: 14,
  pitch: -30,
  bearing: 0,
};

interface DeckMapProps {
  geoData: GeoJSON.FeatureCollection | null;
}

export default function DeckMap({ geoData }: DeckMapProps) {
  const {
    paths,
    pathsRef,
    pathCount,
    createPath,
    extendPath,
    updatePathName,
    updatePathColor,
    updatePathWidth,
    updateNodeName,
    updateNodeZ,
    deletePath: deletePathRecord,
    removeNodes,
    dragNodes,
  } = usePaths();

  // Drawing state
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

  // Edit mode state — Set for multi-selection
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  // When set, "drawing" mode appends nodes to this existing path instead of creating a new one
  const [extendingPathId, setExtendingPathId] = useState<string | null>(null);

  // Refs for stable access inside drag/keyboard callbacks
  const editingPathIdRef = useRef<string | null>(null);
  const selectedNodeIdsRef = useRef<Set<string>>(new Set());
  const isDrawingRef = useRef(false);
  // Drag state refs — updated synchronously at drag start, read during onDrag
  const dragStartCoordRef = useRef<[number, number] | null>(null);
  const dragStartNodeCoordsRef = useRef<Map<string, [number, number]>>(
    new Map(),
  );

  editingPathIdRef.current = editingPathId;
  selectedNodeIdsRef.current = selectedNodeIds;
  isDrawingRef.current = isDrawing;

  // Clear editingPathId if the path was deleted elsewhere
  useEffect(() => {
    if (editingPathId && !paths.find((p) => p.id === editingPathId)) {
      setEditingPathId(null);
      setSelectedNodeIds(new Set());
    }
  }, [paths, editingPathId]);

  // Keyboard: Escape deactivates; Delete/Backspace removes all selected nodes
  useKeyboardListener("Escape", () => {
    if (isDrawingRef.current) {
      setIsDrawing(false);
      setExtendingPathId(null);
      setActivePath([]);
      setHoverCoord(null);
      setIsSnapping(false);
      setSnapIsFirstNode(false);
    } else {
      setEditingPathId(null);
      setSelectedNodeIds(new Set());
    }
  });

  function deleteSelectedNodes() {
    const nodeIds = selectedNodeIdsRef.current;
    const pathId = editingPathIdRef.current;
    if (nodeIds.size === 0 || !pathId) return;
    removeNodes(pathId, nodeIds);
    setSelectedNodeIds(new Set());
  }

  useKeyboardListener("Delete", deleteSelectedNodes, {
    skipInputElements: true,
  });
  useKeyboardListener("Backspace", deleteSelectedNodes, {
    skipInputElements: true,
  });

  const editingPath = paths.find((p) => p.id === editingPathId) ?? null;
  const extendingPath = extendingPathId
    ? (paths.find((p) => p.id === extendingPathId) ?? null)
    : null;
  // Stable key for updateTriggers — avoid creating a new array reference every render
  const selectionKey = [...selectedNodeIds].sort().join(",");

  // --- Drawing geometry ---

  const activePathDisplayCoords = computeActivePathDisplayCoords(
    activePath,
    extendingPath,
  );
  const canSnapClose = computeCanSnapClose(
    activePath,
    extendingPath,
    snapIsFirstNode,
  );
  const showClosingPreview = computeShowClosingPreview(
    isSnapping,
    hoverCoord,
    activePath,
    extendingPath,
    snapIsFirstNode,
  );
  const closingPreviewCoords = computeClosingPreviewCoords(
    showClosingPreview,
    activePath,
    extendingPath,
    hoverCoord,
    snapIsFirstNode,
  );
  const previewStartCoord = computePreviewStartCoord(activePath, extendingPath);
  // Kept in component scope because it is also used in handleClick
  const totalNodesForClose =
    (extendingPath?.nodes.length ?? 0) + activePath.length;

  // --- Drag callbacks ---

  const dragCallbacks: EditNodeDragCallbacks = {
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
      dragNodes(pathId, dragStartNodeCoordsRef.current, dx, dy);
      return true;
    },
    onDragEnd: () => {
      dragStartCoordRef.current = null;
      dragStartNodeCoordsRef.current = new Map();
      setIsDraggingNode(false);
      return true;
    },
  };

  // --- Layers ---

  const layers = [
    buildArcgisLayer(geoData),
    buildPathsLayer(paths, editingPathId),
    buildClosingPreviewLayer(showClosingPreview, closingPreviewCoords, activeColor),
    buildActivePathLayer(activePathDisplayCoords, activeColor, activeWidth),
    buildActiveDotsLayer(activePath, activeColor),
    buildSnapRingLayer(isSnapping, hoverCoord, canSnapClose),
    buildPreviewLayer(isDrawing, previewStartCoord, hoverCoord, activeColor, isSnapping),
    buildEditNodesLayer(editingPath, selectedNodeIds, selectionKey, dragCallbacks),
    buildClosedAreaLabelsLayer(paths),
  ].filter((l): l is NonNullable<typeof l> => l !== null);

  // --- Handlers ---

  function handleClick(info: PickingInfo, event?: { srcEvent?: MouseEvent }) {
    if (isDrawing) {
      if (isSnapping && hoverCoord) {
        if (snapIsFirstNode) {
          if (extendingPath && totalNodesForClose >= 3) {
            // Close the extending path back to its own first node
            finishExtension(true);
          } else if (!extendingPath && activePath.length >= 3) {
            // Self-close a new path
            finishPath(true);
          }
        } else {
          if (extendingPath) {
            // Connect extending path to another path's node, forming a closed area
            finishExtension(true, hoverCoord);
          } else if (activePath.length >= 1) {
            // Connect new path to another path's node, forming a closed area
            finishPath(false, hoverCoord);
          }
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

      // Priority 1: snap to the "root" first node to close the shape.
      // When extending: root = first node of the extending path.
      // When new path: root = first node of activePath (self-close).
      if (extendingPath) {
        const firstNode = extendingPath.nodes[0];
        const canClose = extendingPath.nodes.length + activePath.length >= 3;
        if (canClose) {
          const [px, py] = info.viewport.project([
            firstNode.coords[0],
            firstNode.coords[1],
          ]);
          if (Math.sqrt((cx - px) ** 2 + (cy - py) ** 2) < SNAP_RADIUS_PX) {
            setIsSnapping(true);
            setSnapIsFirstNode(true);
            setHoverCoord(firstNode.coords);
            return;
          }
        }
      } else if (activePath.length >= 3) {
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

      // Priority 2: snap to any node on a completed path (skip extending path's own nodes)
      for (const path of paths) {
        if (path.id === extendingPathId) continue;
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
    setExtendingPathId(null);
    setEditingPathId(null);
    setSelectedNodeIds(new Set());
  }

  function startExtending(pathId: string) {
    setExtendingPathId(pathId);
    setIsDrawing(true);
    setActivePath([]);
    setHoverCoord(null);
    setIsSnapping(false);
    setSnapIsFirstNode(false);
  }

  function cancelDrawing() {
    setIsDrawing(false);
    setExtendingPathId(null);
    setActivePath([]);
    setHoverCoord(null);
    setIsSnapping(false);
    setSnapIsFirstNode(false);
  }

  // Append the in-progress nodes to the extending path.
  // Pass closed=true to mark the result as a closed polygon.
  // Pass extraCoord to snap-append a final node (e.g. from another path) before finishing.
  function finishExtension(closed: boolean, extraCoord?: [number, number]) {
    if (!extendingPathId) return;
    const extraNode: Node | null = extraCoord
      ? {
          id: crypto.randomUUID(),
          name: `Node ${activePath.length + 1}`,
          coords: extraCoord,
          z: 0,
        }
      : null;
    const newNodes = extraNode ? [...activePath, extraNode] : [...activePath];
    extendPath(extendingPathId, newNodes, closed);
    setExtendingPathId(null);
    setActivePath([]);
    setIsDrawing(false);
    setHoverCoord(null);
    setIsSnapping(false);
    setSnapIsFirstNode(false);
  }

  // Creates a new path from the active nodes. Pass snapCoord to append a
  // final snap-to node; isClosed is then derived from the total node count.
  function finishPath(closed: boolean, snapCoord?: [number, number]) {
    const extraNode: Node | null = snapCoord
      ? {
          id: crypto.randomUUID(),
          name: `Node ${activePath.length + 1}`,
          coords: snapCoord,
          z: 0,
        }
      : null;
    const nodes = extraNode ? [...activePath, extraNode] : activePath;
    if (nodes.length < 2) return;
    const name = pathName.trim() || `Path ${pathCount}`;
    const isClosed = snapCoord ? nodes.length >= 3 : closed;
    createPath(nodes, {
      name,
      color: activeColor,
      width: activeWidth,
      isClosed,
    });
    setPathName("");
    setActivePath([]);
    setIsDrawing(false);
    setHoverCoord(null);
    setIsSnapping(false);
    setSnapIsFirstNode(false);
  }

  function deletePath(id: string) {
    deletePathRecord(id);
    if (editingPathId === id) {
      setEditingPathId(null);
      setSelectedNodeIds(new Set());
    }
  }

  // --- Render ---

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

      <MapPanel
        paths={paths}
        pathCount={pathCount}
        editingPathId={editingPathId}
        selectedNodeIds={selectedNodeIds}
        isDrawing={isDrawing}
        activePath={activePath}
        extendingPath={extendingPath}
        isSnapping={isSnapping}
        snapIsFirstNode={snapIsFirstNode}
        pathName={pathName}
        activeColor={activeColor}
        activeWidth={activeWidth}
        onPathNameChange={setPathName}
        onColorChange={setActiveColor}
        onWidthChange={setActiveWidth}
        onStartDrawing={startDrawing}
        onStartExtending={startExtending}
        onCancelDrawing={cancelDrawing}
        onFinishPath={() => finishPath(false)}
        onFinishExtension={() => finishExtension(false)}
        onClearEditing={() => {
          setEditingPathId(null);
          setSelectedNodeIds(new Set());
        }}
        onDeletePath={deletePath}
        onUpdatePathName={updatePathName}
        onUpdatePathColor={updatePathColor}
        onUpdatePathWidth={updatePathWidth}
        onUpdateNodeName={updateNodeName}
        onUpdateNodeZ={updateNodeZ}
      />
    </div>
  );
}
