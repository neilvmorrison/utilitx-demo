export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mimeIcon(mime: string): string {
  if (mime.startsWith("image/")) return "IMG";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("spreadsheet") || mime === "text/csv") return "XLS";
  return "FILE";
}
