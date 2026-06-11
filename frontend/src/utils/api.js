import axios from "axios";
import { getAuth } from "./auth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const isSuperAdmin = (() => {
      try {
        const userObj = JSON.parse(localStorage.getItem("user"));
        return userObj?.role === "superadmin";
      } catch (e) {
        return false;
      }
    })();

    if (status === 401 || (status === 403 && !isSuperAdmin)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        const message = err.response?.data?.message || "Session expired or access denied";
        window.location.href = `/signin?error=${encodeURIComponent(message)}`;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
