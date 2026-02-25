import { NextRequest, NextResponse } from "next/server";
import { ApiKeyManager } from "@esri/arcgis-rest-request";
import { queryFeatures } from "@esri/arcgis-rest-feature-service";

export async function GET(request: NextRequest) {
  const serviceUrl = process.env.ARCGIS_SERVICE_URL;
  const token = process.env.ARCGIS_TOKEN;

  if (!serviceUrl) {
    return NextResponse.json(
      { error: "ARCGIS_SERVICE_URL is not configured in .env" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const xmin = searchParams.get("xmin");
  const ymin = searchParams.get("ymin");
  const xmax = searchParams.get("xmax");
  const ymax = searchParams.get("ymax");

  if (!xmin || !ymin || !xmax || !ymax) {
    return NextResponse.json(
      { error: "Missing bounding box params: xmin, ymin, xmax, ymax" },
      { status: 400 },
    );
  }

  const authentication = token ? ApiKeyManager.fromKey(token) : undefined;

  try {
    const envelope = {
      xmin: parseFloat(xmin),
      ymin: parseFloat(ymin),
      xmax: parseFloat(xmax),
      ymax: parseFloat(ymax),
      spatialReference: { wkid: 4326 },
    };

    const result = await queryFeatures({
      url: serviceUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      geometry: envelope as any,
      geometryType: "esriGeometryEnvelope",
      spatialRel: "esriSpatialRelIntersects",
      inSR: "4326",
      outSR: "4326",
      outFields: ["*"],
      returnGeometry: true,
      resultRecordCount: 200,
      f: "geojson",
      ...(authentication ? { authentication } : {}),
    });

    console.log(
      "[ArcGIS] Feature count:",
      (result as { features?: unknown[] }).features?.length ?? 0,
    );
    console.log(
      "[ArcGIS] Sample:",
      JSON.stringify(
        (result as { features?: unknown[] }).features?.slice(0, 2),
        null,
        2,
      ),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ArcGIS] Query failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch from ArcGIS", detail: String(error) },
      { status: 500 },
    );
  }
}
