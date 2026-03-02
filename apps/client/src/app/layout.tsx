import type { Metadata } from "next";
import "./globals.css";
import AuthWrapper from "@/components/AuthWrapper";

export const metadata: Metadata = {
  title: "Utilitix Map",
  description: "ArcGIS + DeckGL Map Viewer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
