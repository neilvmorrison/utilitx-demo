# Project: Utilitx

This project unifies underground asset records on an interactive map, supporting end-to-end record requests and sharing between parties with basic analytics and AI assistance. Think Google Maps for municipal underground records.

## Stack

- Frontend (apps/client): NextJS (latest) / Typescript / Tailwind / DeckGL (visualizations)
- Backend (apps/server): NestJS (latest) / Typescript
- DB (packages/db): AmazonRDS Postgres (Drizzle ORM)
- Authentication: Amazon Cognito

## Agent Roster

| Agent     | Owns                       | Entry Prompt                  |
| --------- | -------------------------- | ----------------------------- |
| architect | Structure, stack decisions | `.cursor/agents/architect.md` |
| frontend  | All of (apps/client)       | `.cursor/agents/frontend.md`  |
| backend   | All of (apps/server)       | `.cursor/agents/backend.md`   |
| db-admin  | All of (packages/db)       | `.cursor/agents/db-admin.md`  |

## Routing Rules (Hard)

- any change to server -> backend agent owns it
- any change to client -> frontend agent owns it
- any schema/database change -> db-admin agent owns it

## Constraints

- Max file length: 300 lines. Exceeded? Extract a module
- No inline secrets. Use `.env.local` only.
- All API routes require OpenAPI annotation (use `api:generate-openapi` skill)

## Skills Index

See `./cursor/skills` - invoke by filename prefix

## Folder Structure

project-root/
├── CLAUDE.md
├── .cursor/
│ ├── agents/
│ │ ├── architect.md ← architect agent system prompt
│ │ ├── frontend.md
│ │ ├── backend.md
│ ├── sub-agents/
│ │ ├── schema.md ← schema sub-agent brief template
│ │ ├── test-writer.md
│ │ └── openapi.md
│ ├── skills/
│ │ ├── refactor-extract-hook.md
│ │ ├── api-generate-openapi.md
│ │ └── test-unit-vitest.md
│ └── tools/
│ └── tools-manifest.md ← lists available shell/API tools + signatures
├── apps/
│ ├── agents/
│ ├── sub-agents/
│ ├── skills/
│ ├── tools/
