import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginAPI, signupAPI, logoutAPI, getCurrentUserAPI, refreshTokenAPI } from "../services/auth.service.js";
import { setAccessToken } from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state on mount by attempting silent token refresh
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const refreshData = await refreshTokenAPI();
      const accessToken = refreshData?.data?.accessToken;

      if (accessToken) {
        setAccessToken(accessToken);
        const meData = await getCurrentUserAPI();
        setUser(meData?.data || null);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const data = await loginAPI(credentials);
    const { user: userObj, accessToken } = data?.data || {};
    if (accessToken) {
      setAccessToken(accessToken);
    }
    setUser(userObj || null);
    return data;
  };

  const signup = async (userData) => {
    const data = await signupAPI(userData);
    return data;
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
