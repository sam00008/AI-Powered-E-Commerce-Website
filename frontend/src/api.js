import axios from "axios";

// 1. Your specific server URL
const serverUrl = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

const api = axios.create({
  // 2. We append /api/v1 here because your backend routes start with /api/v1
  baseURL: `${serverUrl}/api/v1`, 
  withCredentials: true, // ✅ CRITICAL: This allows cookies to be sent/received
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ AXIOS RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 3. Prevent Infinite Loop Logic:
    // Check if error is 401 (Unauthorized)
    // AND ensure we haven't already retried this specific request (_retry)
    // AND ensure the failed request was NOT the refresh token endpoint itself
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        // 4. Attempt to refresh the token
        // We use the 'api' instance, but target the specific refresh route
        await api.post("/auth/refresh-token");
        
        // 5. If refresh succeeded, retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        // 6. If refresh fails (token invalid/expired), log the user out
        console.error("Session expired. Redirecting to login.");
        
        // Clear local storage if you use it for UI state (optional)
        // localStorage.removeItem("userData"); 
        
        // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    // Return all other errors (so your components can show alerts)
    return Promise.reject(error);
  }
);

export default api;