// import type { GeoJSON } from "geojson";
import MapWrapper from "@/components/MapWrapper";

// Bounding box for downtown Los Angeles (lng/lat, WGS84)
// const BBOX = {
//   xmin: -79.4,
//   ymin: 43.67,
//   xmax: -79.37,
//   ymax: 43.7,
// };

// async function getArcGISData(): Promise<GeoJSON.FeatureCollection | null> {
//   const params = new URLSearchParams({
//     xmin: String(BBOX.xmin),
//     ymin: String(BBOX.ymin),
//     xmax: String(BBOX.xmax),
//     ymax: String(BBOX.ymax),
//   });

//   try {
//     const baseUrl = "http://localhost:3001";
//     console.log(baseUrl);
//     const response = await fetch(`${baseUrl}/api/arcgis?${params}`, {
//       next: { revalidate: 300 },
//     });

//     if (!response.ok) {
//       console.error("[page] ArcGIS fetch failed with status:", response.status);
//       return null;
//     }

//     const data: GeoJSON.FeatureCollection = await response.json();

//     console.log("[page] ArcGIS features received:", data.features?.length ?? 0);
//     console.log(
//       "[page] ArcGIS data sample:",
//       JSON.stringify(data.features?.slice(0, 2), null, 2),
//     );

//     return data;
//   } catch (error) {
//     console.error("[page] Failed to load ArcGIS data:", error);
//     return null;
//   }
// }

export default async function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <MapWrapper geoData={null} />
    </main>
  );
}
