// src/context/authContext.jsx (Final Corrected Version)

import React, { createContext, useState, useEffect, useContext } from "react";

// Create context
export const authDataContext = createContext();

// Define the API URL (Standard practice to keep base URLs centralized)
const API_BASE_URL = "http://localhost:3000/api";

// Context provider component
const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                // Correct URL structure: http://localhost:3000/api/v1/auth/current-user
                const res = await fetch(`${API_BASE_URL}/v1/auth/current-user`, {
                    method: "GET",
                    credentials: "include", // ESSENTIAL for sending the HTTP-only cookie
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserStatus();
    }, []);

    const value = {
        user,
        setUser,
        loading,
        API_BASE_URL, // Provide the base URL for other components to use
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <p className="text-xl font-medium">Loading User Session...</p>
            </div>
        );
    }

    return (
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
    );
};

// Custom hook to easily use the context
export const useAuth = () => {
    return useContext(authDataContext);
};

export default AuthContextProvider;