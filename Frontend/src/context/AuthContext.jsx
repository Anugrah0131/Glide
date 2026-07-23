import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axiosConfig";
import { disconnectSocket } from "../hooks/useSocket";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.token) {
            // Verify token with backend
            try {
              const { data } = await axios.get("/auth/me");
              if (data.success) {
                // Merge token back into user object from backend
                setUser({ ...data.user, token: parsed.token });
              } else {
                localStorage.removeItem("user");
                setUser(null);
              }
            } catch (err) {
              console.error("Session verification failed:", err);
              if (err.response?.status === 401) {
                localStorage.removeItem("user");
                setUser(null);
              } else {
                // Network error or other, keep current state for now
                setUser(parsed);
              }
            }
          } else if (parsed.isGuest) {
            setUser(parsed);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/auth/login", { email, password });
    if (data.success) {
      const userData = { ...data.user, token: data.token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post("/auth/register", {
      username,
      email,
      password,
    });
    if (data.success) {
      const userData = { ...data.user, token: data.token };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    return data;
  };

  const guestLogin = async () => {
    try {
      const { data } = await axios.get("/auth/guest");
      if (data.success) {
        const userData = { ...data.user, token: null };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error("Guest login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      disconnectSocket();
      localStorage.removeItem("user");
      setUser(null);
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, register, logout, guestLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
