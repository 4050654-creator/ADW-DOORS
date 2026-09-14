import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "adw_store_token";
const USER_KEY = "adw_store_user";

function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const currentUser = response.data?.user;

        if (!currentUser) {
          throw new Error("User data not found");
        }

        setToken(savedToken);
        setUser(currentUser);

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error("Session restore failed:", error);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const newToken = response.data?.token;
    const loggedUser = response.data?.user;

    if (!newToken) {
      throw new Error("Login token nahi mila.");
    }

    if (!loggedUser) {
      throw new Error("User data nahi mila.");
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(loggedUser)
    );

    setToken(newToken);
    setUser(loggedUser);

    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthProvider;