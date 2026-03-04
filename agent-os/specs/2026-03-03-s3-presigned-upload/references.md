# Reference Implementations

## Backend patterns
- `apps/server/src/database/base.repository.ts` — Generic CRUD + soft-delete base class
- `apps/server/src/database/projects.repository.ts` — Extends BaseRepository, reference for new repository
- `apps/server/src/projects/projects.controller.ts` — Auth decorators, OpenAPI annotations, controller structure

## Frontend patterns
- `apps/client/src/hooks/useProjects.ts` — React Query mutations with optimistic updates
- `apps/client/src/components/ui/forms/FileUpload.tsx` — Existing drag-and-drop upload component (reuse directly)
- `apps/client/src/lib/api-types.ts` — API type interface pattern
- `apps/client/src/lib/query-keys.ts` — Query key factory pattern
