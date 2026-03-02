"use client";

import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      router.replace("/");
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a2e",
        color: "#ccc",
        fontFamily: "sans-serif",
      }}
    >
      Signing in...
    </div>
  );
}
