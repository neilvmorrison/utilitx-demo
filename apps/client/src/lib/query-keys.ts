export const queryKeys = {
  projects: () => ["projects"] as const,
  layers: (projectId: string) => ["layers", projectId] as const,
  paths: (projectId: string) => ["paths", projectId] as const,
  pathNodes: (pathId: string) => ["path-nodes", pathId] as const,
};
