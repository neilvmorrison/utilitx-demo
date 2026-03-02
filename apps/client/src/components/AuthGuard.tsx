"use client";

import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { setAccessToken } from "@/lib/api";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();

  useEffect(() => {
    const token = auth.user?.access_token ?? null;
    setAccessToken(token);
  }, [auth.user?.access_token]);

  if (auth.isLoading) {
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
        Loading...
      </div>
    );
  }

  if (auth.error) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#1a1a2e",
          color: "#ccc",
          fontFamily: "sans-serif",
        }}
      >
        <p>Error: {auth.error.message}</p>
        <button
          type="button"
          onClick={() => auth.signinRedirect()}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Sign in
        </button>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#1a1a2e",
          color: "#ccc",
          fontFamily: "sans-serif",
        }}
      >
        <button
          type="button"
          onClick={() => auth.signinRedirect()}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Sign in
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
