import { api } from "./api.js";

export const loginAPI = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const signupAPI = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const refreshTokenAPI = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};
