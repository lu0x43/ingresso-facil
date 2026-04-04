import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/api";

type StoredUser = {
  id?: string;
  name: string;
  email?: string;
  role?: string;
};

type LoginPayload = {
  token: string;
  user: StoredUser;
};

type AuthContextType = {
  token: string | null;
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  syncAuth: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const syncAuth = useCallback(() => {
    setToken(localStorage.getItem("token"));
    setUser(getStoredUser());
  }, []);

  const login = useCallback(({ token, user }: LoginPayload) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token || token === "null") {
        logout();
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await api.get("/users/me", {
          showErrorToast: false,
        });

        const backendUser = {
          id: res.data.id ?? res.data.Id,
          name: res.data.name ?? res.data.Name,
          email: res.data.email ?? res.data.Email,
          role: res.data.role ?? res.data.Role,
        };

        localStorage.setItem("user", JSON.stringify(backendUser));
        setUser(backendUser);
        setToken(token);
      } catch {
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  useEffect(() => {
    const handleAuthChanged = () => syncAuth();
    const handleAuthExpired = () => logout();

    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [syncAuth, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      isAuthLoading,
      login,
      logout,
      syncAuth,
    }),
    [token, user, isAuthLoading, login, logout, syncAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};