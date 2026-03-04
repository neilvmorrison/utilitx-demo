# S3 Presigned URL Upload/Download for Project Files

## Overview
Integrate S3 presigned URLs to allow users to upload documents and images to projects and download/view them. Browser uploads directly to S3 via presigned PUT URLs; metadata tracked in `project_files` DB table.

## Tasks
1. DB: Add `project_files` table to `packages/db/src/schema.ts`
2. Backend: Create global `S3Module` with presigned URL service
3. Backend: Create `ProjectFilesModule` with controller/service/repository
4. Frontend: Add `useProjectFiles` hook + API types
5. Frontend: Create `ProjectFilesPanel` + integrate into `DeckMap.tsx`

## Endpoints
| Method | Path | Action |
|--------|------|--------|
| POST | `/projects/:projectId/files/presign-upload` | Get presigned PUT URL |
| GET | `/projects/:projectId/files` | List files |
| GET | `/projects/:projectId/files/:fileId/presign-download` | Get presigned GET URL |
| DELETE | `/projects/:projectId/files/:fileId` | Soft-delete |

## Upload Flow
1. Frontend POSTs `{ fileName, mimeType, fileSize }` to presign-upload endpoint
2. Backend validates, generates S3 key, creates DB record, returns `{ uploadUrl, file }`
3. Frontend PUTs file directly to S3 using presigned URL
4. React Query invalidates file list

## Download Flow
1. Frontend GETs presign-download endpoint
2. Backend looks up file record, returns `{ downloadUrl }`
3. Frontend opens URL in new tab
