import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, setUnauthorizedHandler } from "../api/client";
import { extractErrorMessage } from "../lib/apiError";
import { decodeJwtPayload } from "../lib/jwt";
import { clearToken, getToken, setToken } from "../lib/token";
import { AuthContext, type AuthContextValue } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await apiClient.POST("/auth/login", {
      body: {
        username: email,
        password,
        grant_type: "password",
        scope: "",
      },
      bodySerializer(body) {
        return new URLSearchParams(body as Record<string, string>).toString();
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (error) {
      throw new Error(extractErrorMessage(error, "Email o contraseña incorrectos"));
    }

    setToken(data.access_token);
    setTokenState(data.access_token);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await apiClient.POST("/auth/register", {
      body: { email, password },
    });

    if (error) {
      throw new Error(extractErrorMessage(error, "No se pudo completar el registro"));
    }

    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: token !== null,
      email: decodeJwtPayload(token ?? "")?.sub ?? null,
      login,
      register,
      logout,
    }),
    [token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
