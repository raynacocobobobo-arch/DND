import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiRequest } from "../api/client";

interface AuthContextValue {
  authenticated: boolean;
  loading: boolean;
  login(password: string, email?: string): Promise<void>;
  signup(email: string, password: string): Promise<boolean>;
  sendMagicLink(email: string): Promise<void>;
  acceptMagicLink(link: string): Promise<void>;
  recoverRedirect(redirectedUrl: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<{ authenticated: true }>("/api/session")
      .then(() => {
        if (active) setAuthenticated(true);
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticated,
      loading,
      async login(password: string, email?: string) {
        await apiRequest<{ authenticated: true }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ password, email })
        });
        setAuthenticated(true);
      },
      async signup(email: string, password: string) {
        const result = await apiRequest<{ authenticated: boolean; confirmationRequired: boolean }>("/api/auth/signup", {
          method: "POST", body: JSON.stringify({ email, password })
        });
        if (result.authenticated) setAuthenticated(true);
        return result.confirmationRequired;
      },
      async sendMagicLink(email: string) {
        await apiRequest<{ sent: true }>("/api/auth/magic-send", {
          method: "POST", body: JSON.stringify({ email })
        });
      },
      async acceptMagicLink(link: string) {
        await apiRequest<{ authenticated: true }>("/api/auth/magic-accept", {
          method: "POST", body: JSON.stringify({ link })
        });
        setAuthenticated(true);
      },
      async recoverRedirect(redirectedUrl: string) {
        await apiRequest<{ authenticated: true }>("/api/auth/recover-redirect", {
          method: "POST", body: JSON.stringify({ redirectedUrl })
        });
        setAuthenticated(true);
      },
      async logout() {
        await apiRequest<void>("/api/auth/logout", { method: "POST" });
        setAuthenticated(false);
      }
    }),
    [authenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
