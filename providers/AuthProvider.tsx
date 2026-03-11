"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { getUser, clearSession, setSession } from "@/lib/auth";
import api from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empieza cargando
  const router = useRouter();

  useEffect(() => {
    async function hydrateAuth() {
      try {
        const currentUser = getUser();
        const token = localStorage.getItem("access_token");

        if (currentUser && token) {
          // Configuramos headers globales
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          api.defaults.headers.common["x-organization-id"] =
            currentUser.organizationId;

          setUser(currentUser);

          // Opcional: Validar el token con el backend para estar 100% seguros
          // await api.get("/auth/verify");
        }
      } catch (error) {
        console.error("Error hidratando sesión:", error);
        clearSession();
      } finally {
        // ¡ESTO ES LO QUE FALTABA!
        setIsLoading(false);
      }
    }

    hydrateAuth();
  }, []);

  async function login(email: string, password: string) {
    try {
      setIsLoading(true);
      const { data } = await api.post<{ accessToken: string; user: User }>(
        "/auth/login",
        { email, password },
      );

      setSession(data.accessToken, data.user);
      document.cookie = `access_token=${data.accessToken}; path=/; SameSite=Strict`;

      api.defaults.headers.common["Authorization"] =
        `Bearer ${data.accessToken}`;
      api.defaults.headers.common["x-organization-id"] =
        data.user.organizationId;

      setUser(data.user);
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearSession();
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    delete api.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["x-organization-id"];
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
