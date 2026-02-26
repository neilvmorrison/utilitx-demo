# Utilitix Sandbox

A sandbox for building 3D utility-infrastructure map visualizations on top of live ArcGIS data. Intended for city officials and field teams: draw, annotate, and persist paths representing underground/overground utility lines directly on a base map.

## What it does

- Renders a 3D interactive map (deck.gl + MapLibre) over free OpenFreeMap tiles — no paid API key required.
- Fetches real feature data from an ArcGIS Feature Service, displayed as a GeoJSON layer underneath any drawn paths.
- Lets users draw multi-node **line paths** and **closed polygons** on the map, with full node-level editing (drag, rename, set Z elevation).
- Each path carries metadata: name, utility type (color preset), stroke width, and per-node Z value for subterranean depth representation.
- Drawn paths are persisted to `localStorage` so work survives page refreshes.

## Stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript, `src/` layout) |
| Map renderer | deck.gl 9.x + `@deck.gl/react` + `@deck.gl/layers` |
| Base map | react-map-gl v8 + maplibre-gl v5 |
| Tiles | [OpenFreeMap liberty style](https://tiles.openfreemap.org/styles/liberty) — no API key |
| ArcGIS SDK | `@esri/arcgis-rest-feature-service` + `@esri/arcgis-rest-request` |

## Setup

```bash
npm install
```

Create a `.env.local` file:

```
ARCGIS_SERVICE_URL=https://your-org.arcgis.com/arcgis/rest/services/YourService/FeatureServer/0
ARCGIS_TOKEN=your_token_here   # optional — omit for public services
```

```bash
npm run dev
```

## Key architecture notes

### SSR guard (Next.js 15)

deck.gl can't run on the server. The three-layer pattern used here:

```
page.tsx              ← Server Component, fetches ArcGIS data
  └─ MapWrapper.tsx   ← 'use client', applies dynamic(..., { ssr: false })
       └─ DeckMap.tsx ← 'use client', contains all deck.gl code
```

`ssr: false` must be called from a Client Component — it cannot be used directly in Server Components in Next.js 15.

### ArcGIS proxy (`/api/arcgis`)

The route at `src/app/api/arcgis/route.ts` acts as a server-side proxy to the ArcGIS Feature Service. It accepts a bounding box query (`xmin`, `ymin`, `xmax`, `ymax` in WGS84) and returns GeoJSON. Capped at 200 features for performance. The token never reaches the client.

### Drawing model

Paths are managed in `usePaths` (`src/hooks/usePaths.ts`). Each path is a `DrawnPath`:

```ts
type DrawnPath = {
  id: string;
  name: string;
  nodes: Node[];   // ordered list of [lng, lat] + z elevation
  color: string;
  width: number;
  isClosed: boolean;
};
```

Drawing modes:
- **New path** — click to place nodes, snap to close or Finish Path button.
- **Extend** — append new nodes to an existing path; can snap-connect to another path's node to form a closed area.
- **Edit** — click a completed path to enter node-edit mode: drag nodes, multi-select with Shift, Delete to remove.

Snap detection (`SNAP_RADIUS_PX = 20`) runs in screen space during `onHover`, with priority: (1) first node of own path (self-close), (2) any node on another completed path (connect & close).

### Persistence

`src/lib/storage.ts` provides typed `loadFromStorage` / `saveToStorage` helpers. `usePaths` seeds its state from `localStorage` on mount and syncs back via `useEffect` on every mutation. Keys: `utilitix_paths`, `utilitix_pathCount`.

### Utility presets (`src/constants.ts`)

Color-coded presets follow APWA uniform color codes:

| Type | Color |
|---|---|
| Electrical / Power | Red `#FF0000` |
| Gas / Oil / Steam | Yellow `#FFCC00` |
| Potable Water | Blue `#0070C0` |
| Sewer / Drain | Green `#00A550` |
| Telecommunications | Orange `#FF8000` |
| Reclaimed Water | Purple `#9900CC` |
| Proposed Excavation | White `#FFFFFF` |
| Survey Markings | Pink `#FF69B4` |

### Webpack shim

`next.config.ts` sets `worker_threads: false` and `fs: false` as browser fallbacks. This is required because `loaders.gl` (a deck.gl transitive dependency) conditionally references Node-only modules.

## File map

```
src/
  app/
    page.tsx                  # Server Component entry point
    api/arcgis/route.ts       # ArcGIS Feature Service proxy
  components/
    MapWrapper.tsx            # SSR boundary (dynamic import)
    DeckMap.tsx               # Main map component, all interaction logic
    MapPanel.tsx              # Sidebar UI (drawing controls, path list)
    PathListItem.tsx          # Per-path row in the sidebar
  hooks/
    usePaths.ts               # Path state + localStorage persistence
    useKeyboardListener.ts    # Keyboard shortcut hook
  lib/
    layers.ts                 # deck.gl layer builders
    drawingGeometry.ts        # Snap/preview geometry computations
    storage.ts                # localStorage read/write utility
  constants.ts                # UTILITY_PRESETS color codes
```
