"use client";

import dynamic from "next/dynamic";

const AuthProvider = dynamic(() => import("@/components/AuthProvider"), {
  ssr: false,
});
const AuthGuard = dynamic(() => import("@/components/AuthGuard"), {
  ssr: false,
});

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
