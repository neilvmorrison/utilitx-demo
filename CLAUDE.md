# CLAUDE.md

A 3D utility infrastructure map for city officials. Draw, annotate, and persist utility paths (gas, water, electrical, etc.) over live ArcGIS feature data.

## Principles

- **Atomic functions** — layer builders, geometry helpers, and state mutators should be small, pure, and composable.
- **Performance first** — target mid/low-grade hardware. Always set `updateTriggers` on deck.gl layers that use accessor functions. Avoid creating new object/array references in render unless data actually changed.

## Stack

- Next.js 15 · App Router · TypeScript · `src/` layout
- deck.gl 9.x (`@deck.gl/react`, `@deck.gl/layers`)
- react-map-gl v8 + maplibre-gl v5 — import Map from `react-map-gl/maplibre`
- Base tiles: `https://tiles.openfreemap.org/styles/liberty` — no API key required
- ArcGIS: `@esri/arcgis-rest-feature-service` + `@esri/arcgis-rest-request`

## SSR pattern (do not break)

deck.gl cannot run server-side. The required three-layer structure:

```
page.tsx (Server Component)
  └─ MapWrapper.tsx ('use client') → dynamic(() => import('./DeckMap'), { ssr: false })
       └─ DeckMap.tsx ('use client') → all deck.gl code
```

`ssr: false` must be called from a Client Component. Do not move `dynamic()` into a Server Component.

## Environment variables

```
ARCGIS_SERVICE_URL=  # required — ArcGIS Feature Service endpoint URL
ARCGIS_TOKEN=        # optional — omit for public services
```

Token is server-only and never reaches the browser. The `/api/arcgis` route is the only thing that reads it.

## Data model (`src/hooks/usePaths.ts`)

```ts
type Node = {
  id: string;                  // crypto.randomUUID()
  name: string;
  coords: [number, number];    // [lng, lat] WGS84
  z: number;                   // elevation in metres; negative = underground
};

type DrawnPath = {
  id: string;
  name: string;
  nodes: Node[];
  color: string;               // hex string e.g. "#FF0000"
  width: number;               // pixels, clamped 1–20
  isClosed: boolean;           // true = closed polygon area; requires ≥3 nodes
};
```

All mutation goes through `usePaths` functions — never mutate `paths` state directly.

## Layer IDs (string-matched in click/hover handlers — keep in sync)

| ID | Builder | Handler reference |
|---|---|---|
| `"drawn-paths"` | `buildPathsLayer` | `handleClick` — activates edit mode |
| `"edit-nodes"` | `buildEditNodesLayer` | `handleClick` — node selection |
| `"arcgis-geojson"` | `buildArcgisLayer` | — |
| `"active-path"` | `buildActivePathLayer` | — |
| `"active-dots"` | `buildActiveDotsLayer` | — |
| `"snap-ring"` | `buildSnapRingLayer` | — |
| `"closing-preview"` | `buildClosingPreviewLayer` | — |
| `"preview-line"` | `buildPreviewLayer` | — |
| `"closed-area-labels"` | `buildClosedAreaLabelsLayer` | — |

If a layer ID changes, update all `info.layer?.id === "..."` checks in `DeckMap.tsx`.

## Key implementation patterns

**Stable callbacks via refs** — `pathsRef`, `editingPathIdRef`, `selectedNodeIdsRef`, `isDrawingRef` are kept in sync with state on every render so drag/keyboard callbacks read current values without stale closures. Do not remove this pattern.

**`selectionKey`** — sorted, joined string of selected node IDs used in `updateTriggers`. Avoids deck.gl skipping re-renders due to stable `Set` references.

**Drag coordinate math** — snapshots start coords at `onDragStart` (`dragStartNodeCoordsRef`) and applies delta fresh on each `onDrag` frame. Prevents cumulative float drift.

**Snap detection** (`SNAP_RADIUS_PX = 20`) — runs in screen space during `handleHover`. Priority: (1) own path's first node (self-close polygon), (2) any node on any other completed path (connect & close).

**Closed polygon Z offset** — `buildPathsLayer` applies `i * 0.5` Z per path index on closed paths to prevent z-fighting between overlapping polygons.

**`updateTriggers` rule** — every accessor that is a function (e.g. `getFillColor: (f) => ...`) must have a corresponding `updateTriggers` entry, or deck.gl will skip re-renders when dependencies change.

## File map

```
src/
  app/
    page.tsx                   # Server Component entry; passes geoData to MapWrapper
    api/arcgis/route.ts        # ArcGIS proxy: bbox params → GeoJSON, capped at 200 records
  components/
    MapWrapper.tsx             # SSR boundary only — do not add logic here
    DeckMap.tsx                # All interaction state, layer assembly, event handlers
    MapPanel.tsx               # Sidebar UI: drawing controls, path list
    PathListItem.tsx           # Per-path row: inline name/color/width/node editing
  hooks/
    usePaths.ts                # Path state + localStorage persistence
    useKeyboardListener.ts     # Keyboard hook; set skipInputElements:true to skip <input>
  lib/
    layers.ts                  # Pure layer builder functions; also exports hexToRgb, computeCentroid
    drawingGeometry.ts         # Pure geometry: snap, preview, closing logic
    storage.ts                 # loadFromStorage / saveToStorage / clearStorage (SSR-safe)
  constants.ts                 # UTILITY_PRESETS — APWA standard color codes
next.config.ts                 # Webpack: worker_threads/fs → false (required by loaders.gl)
```

## Persistence

`usePaths` auto-persists to `localStorage` via two `useEffect`s:
- `utilitix_paths` → `DrawnPath[]`
- `utilitix_pathCount` → `number` (monotonic; drives default path names like "Path 3")

## Utility presets — do not change these color values (APWA standard)

| Label | Hex |
|---|---|
| Electrical / Power | `#FF0000` |
| Gas / Oil / Steam | `#FFCC00` |
| Potable Water | `#0070C0` |
| Sewer / Drain | `#00A550` |
| Telecommunications | `#FF8000` |
| Reclaimed Water | `#9900CC` |
| Proposed Excavation | `#FFFFFF` |
| Survey Markings | `#FF69B4` |
