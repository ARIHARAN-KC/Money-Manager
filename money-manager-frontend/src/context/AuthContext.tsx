import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { login as loginApi, register as registerApi } from "../api/auth";
import api from "../utils/apiClient";
import { setTokens, removeTokens, getAccessToken } from "../utils/token";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Restore user on app refresh
  useEffect(() => {
    // console.log("AuthProvider - Initializing...");
    const token = getAccessToken();
    
    if (!token) {
      // console.log("AuthProvider - No token found");
      setLoading(false);
      setInitialized(true);
      return;
    }

    // console.log("AuthProvider - Token found, fetching user...");
    api
      .get("/auth/me")
      .then((res) => {
        // console.log("AuthProvider - User fetched successfully:", res.data.user);
        setUser(res.data.user);
      })
      .catch((error) => {
        console.error("AuthProvider - Failed to restore auth:", error);
        removeTokens();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
        // console.log("AuthProvider - Initialization complete");
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // console.log("AuthContext - Attempting login for:", email);
      const { data } = await loginApi({ email, password });
      
      if (!data.token || !data.refreshToken) {
        console.error("AuthContext - Login failed: Missing tokens");
        throw new Error("Authentication failed: Missing tokens");
      }
      
      // console.log("AuthContext - Login successful, setting tokens");
      setTokens(data.token, data.refreshToken);
      setUser(data.user);
      
      // console.log("AuthContext - User set:", data.user);
      return Promise.resolve();
    } catch (error: any) {
      console.error("AuthContext - Login error:", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // console.log("AuthContext - Attempting registration for:", email);
      const { data } = await registerApi({ name, email, password });
      
      if (!data.token || !data.refreshToken) {
        console.error("AuthContext - Registration failed: Missing tokens");
        throw new Error("Registration failed: Missing tokens");
      }
      
      // console.log("AuthContext - Registration successful, setting tokens");
      setTokens(data.token, data.refreshToken);
      setUser(data.user);
      
      console.log("AuthContext - User set:", data.user);
      return Promise.resolve();
    } catch (error: any) {
      console.error("AuthContext - Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    // console.log("AuthContext - Logging out");
    removeTokens();
    setUser(null);
  };

  const setUserWithLog = (userData: User) => {
    // console.log("AuthContext - Setting user manually:", userData);
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    loading: loading || !initialized,
    login,
    register,
    logout,
    setUser: setUserWithLog,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};