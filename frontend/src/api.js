// src/api.js
import axios from "axios";

const serverUrl = "http://localhost:3000";

const api = axios.create({
    baseURL: `${serverUrl}/api/v1`,
    withCredentials: true, // ✅ Always send cookies
});

// 💡 AXIOS INTERCEPTOR - This is the magic
api.interceptors.response.use(
    (response) => {
        // Any status code 2xx is fine, just return the response
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 1. Check if it's a 401 error and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried

            try {
                // 2. Call the refresh-token endpoint
                await api.post("/auth/refresh-token");
                
                // 3. If refresh is successful, retry the original request
                return api(originalRequest);
                
            } catch (refreshError) {
                // 4. If refresh fails (e.g., refresh token expired)
                // We must log the user out.
                // You can redirect or just let other parts of the app fail.
                console.error("Session expired, please log in again.");
                // This will trigger the `getCurrentUser` catch block
                return Promise.reject(refreshError);
            }
        }

        // For any other error, just reject
        return Promise.reject(error);
    }
);

export default api;