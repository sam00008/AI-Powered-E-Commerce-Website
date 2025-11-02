// src/api.js
import axios from "axios";

// 🟩 Use your Render backend URL
const serverUrl = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

const api = axios.create({
  baseURL: `${serverUrl}/api/v1`,
  withCredentials: true, // ✅ Send cookies for auth/session
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 AXIOS RESPONSE INTERCEPTOR (handles expired tokens)
api.interceptors.response.use(
  (response) => response, // ✅ Return successful responses as is
  async (error) => {
    const originalRequest = error.config;

    // ⚠️ If unauthorized (401) and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔁 Try to refresh the token
        await api.post("/auth/refresh-token");

        // 🔄 Retry the original request after refreshing token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired — please log in again.");
        // Optionally, clear local/session storage or redirect
        localStorage.removeItem("userData");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // ❌ For all other errors, just pass them forward
    return Promise.reject(error);
  }
);

export default api;
