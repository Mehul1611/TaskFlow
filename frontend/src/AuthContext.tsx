import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as api from "./api";
import type { UserPublic } from "./types";

type AuthCtx = {
  user: UserPublic | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(() => api.getStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    api.saveSession(res.access_token, res.user);
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    api.saveSession(res.access_token, res.user);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    api.clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
