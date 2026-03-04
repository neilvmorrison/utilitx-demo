// API response shapes — mirrors what the server's Drizzle queries return.
// Keep in sync with the server's Drizzle schema in packages/db/src/schema.ts.

export interface ApiProject {
  id: string;
  name: string;
  ownerId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiLayer {
  id: string;
  name: string;
  isVisible: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiPath {
  id: string;
  name: string;
  color: string;
  width: number;
  isClosed: boolean;
  isHidden: boolean;
  layerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiPathNode {
  id: string;
  name: string;
  position: number;
  pathId: string;
  point: { lng: number; lat: number; z: number };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiProjectFile {
  id: string;
  projectId: string;
  uploadedById: string;
  fileName: string;
  s3Key: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  file: ApiProjectFile;
}

export interface PresignDownloadResponse {
  downloadUrl: string;
  file: ApiProjectFile;
}
