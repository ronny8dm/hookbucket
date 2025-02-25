import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log("Checking auth...");
      const BASE_URL = "https://hookbucket-7bk4.vercel.app";

      const response = await fetch(`${BASE_URL}/auth/session`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Auth response:", response.status);

      if (response.ok) {
        const session = await response.json();
        console.log("Session data:", session);
        setIsAuthenticated(!!session?.user);
      } else {
        console.log("No session found");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    loading,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
