import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ✅ 1. Export with consistent naming
export const authDataContext = createContext({
    adminData: null,
    loading: true,
    serverUrl: "",
    loginAdmin: () => { },
    logoutAdmin: () => { },
});

const AuthProvider = ({ children }) => {
    const serverUrl = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

    // ✅ 2. Add state for the authenticated user and loading status
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to check if the admin is currently logged in (used on initial load)
    const checkAdminStatus = useCallback(async () => {
        try {
            // axios.defaults.withCredentials = true is set in index.jsx, so this is safe
            const res = await axios.get(`${serverUrl}/api/v1/auth/admin/current-admin`);

            // Assuming res.data.data contains { email, role }
            if (res.data.status === 200 && res.data.data?.email) {
                setAdminData(res.data.data);
            } else {
                setAdminData(null);
            }
        } catch (error) {
            // This is expected if the cookie is expired or missing (401/403)
            setAdminData(null);
        } finally {
            setLoading(false);
        }
    }, [serverUrl]);

    // Function to handle Admin Login API call
    const loginAdmin = async (email, password) => {
        try {
            // Ensure credentials: 'include' is set globally for axios if not here
            const res = await axios.post(`${serverUrl}/api/v1/auth/admin/login`, { email, password });

            if (res.data.status === 200) {
                // Assuming the response data has the structure { email, role }
                setAdminData(res.data.data);
                toast.success("Admin login successful!");
                return true;
            }
            // Note: If the backend throws a 401/403 ApiError, Axios moves to the catch block.
            return false; // Should not be reached in typical error flow, but safe practice

        } catch (error) {
            // Handle specific errors from the backend (e.g., Invalid credentials from ApiError)
            const errorMessage = error.response?.data?.message || "Login failed due to network error.";
            toast.error(errorMessage);
            return false; // Indicate login failure
        }
    };

    // Function to handle Admin Logout API call
    const logoutAdmin = async () => {
        try {
            await axios.post(`${serverUrl}/api/v1/auth/admin/logout`);
            setAdminData(null);
            toast.info("Logged out successfully.");
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            // Even if the API call fails, clear local state as a fallback
            setAdminData(null);
            toast.error("Logout failed, but session cleared locally.");
            return false;
        }
    };

    // ✅ 3. Check status on component mount
    useEffect(() => {
        checkAdminStatus();
    }, [checkAdminStatus]); // Dependency array includes checkAdminStatus

    const value = {
        serverUrl,
        adminData,
        loading,
        loginAdmin,
        logoutAdmin,
        checkAdminStatus
    };

    // Show a loading screen while checking auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Initializing authentication...</p>
            </div>
        );
    }

    return (
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
    );
};

export default AuthProvider;