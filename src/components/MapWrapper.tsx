"use client";

import dynamic from "next/dynamic";
import type { GeoJSON } from "geojson";

// ssr: false must live in a Client Component in Next.js 15+
// This wrapper is that boundary — page.tsx (Server Component) uses this.
const DeckMap = dynamic(() => import("@/components/DeckMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a2e",
        color: "#ccc",
        fontSize: "1rem",
        fontFamily: "sans-serif",
      }}
    >
      Loading map...
    </div>
  ),
});

interface MapWrapperProps {
  geoData: GeoJSON.FeatureCollection | null;
}

export default function MapWrapper({ geoData }: MapWrapperProps) {
  return <DeckMap geoData={geoData} />;
}
