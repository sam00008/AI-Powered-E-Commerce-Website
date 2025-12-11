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
        const res = await axios.get(
            `${serverUrl}/api/v1/auth/admin/current-admin`,
            { withCredentials: true }
        );

        if (res.data.status === 200) {
            setAdminData(res.data.data);
        } else {
            setAdminData(null);
        }

    } catch {
        setAdminData(null);
    } finally {
        setLoading(false);
    }
}, [serverUrl]);

    // Function to handle Admin Login API call
    const loginAdmin = async (email, password) => {
    try {
        const res = await axios.post(
            `${serverUrl}/api/v1/auth/admin/login`,
            { email, password },
            { withCredentials: true }
        );

        if (res.data.status === 200) {
            setAdminData(res.data.data);
            toast.success("Admin login successful!");
            return true;
        }

        return false;

    } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed.";
        toast.error(errorMessage);
        return false;
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