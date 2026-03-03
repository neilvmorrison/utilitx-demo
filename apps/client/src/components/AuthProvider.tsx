"use client";

import { useEffect } from "react";
import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { cognitoAuthConfig } from "@/lib/cognito-oidc-config";
import { initApi } from "@/lib/api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (url) initApi({ baseURL: url });
  }, []);

  return (
    <OidcAuthProvider
      {...cognitoAuthConfig}
      onSigninCallback={() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
    >
      {children}
    </OidcAuthProvider>
  );
}
