# Shaping Notes

## Scope
- Upload documents (PDF, XLSX, CSV) and images (PNG, JPEG, WebP, SVG) to projects
- Files attached to projects (not layers/paths)
- Max file size: 50MB
- Presigned URLs for direct browser-to-S3 upload/download

## Decisions
- S3 bucket already exists; no bucket creation needed
- File record created before upload completes (simpler; orphaned records acceptable)
- No per-project authorization yet (any authenticated user can access any project's files)
- Upload presigned URL TTL: 5 minutes; download TTL: 1 hour
- S3 key format: `projects/{projectId}/{uuid}.{ext}`
- Soft-delete pattern consistent with all other tables

## Context
- Reuse existing `FileUpload.tsx` component for drag-and-drop UI
- Follow existing repository pattern (`BaseRepository`) and React Query patterns (`useProjects`)
- No visuals provided; UI styled to match existing `LayersPanel` glass-morphism
