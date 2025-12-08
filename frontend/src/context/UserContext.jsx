import React, { useState, useEffect, createContext, useCallback } from "react";
import api from "../api.js"; // Import your configured Axios instance

export const UserDataContext = createContext();

function UserContextProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Wrap getCurrentUser in useCallback to stabilize it
  const getCurrentUser = useCallback(async () => {
  // Only set loading TRUE if userData is not already known
  if (!userData) setLoading(true);

  try {
    const res = await api.get("/auth/current-user");

    if (res.data?.data?.user) {
      setUserData(res.data.data.user);
    } else {
      setUserData(null);
    }
  } catch (error) {
    console.log("Not logged in or session check failed.");
    setUserData(null);
  } finally {
    setLoading(false);
  }
}, [userData]); // Empty dependency array ensures this function is created once

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUserData(null);
      // Optional: Force a window reload to clear all cached state after logout
      // window.location.reload(); 
    } catch (error) {
      console.error("Logout failed", error);
      setUserData(null); // Clear locally anyway
    }
  };

  // 3. Run getCurrentUser only once on component mount
  useEffect(() => {
    // You can optionally add a cleanup function here if required by a complex use case
    getCurrentUser();
  }, [getCurrentUser]); // Dependency is stable due to useCallback

  // 4. Render Loading state globally
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <p className="text-xl font-medium">Loading User Session...</p>
      </div>
    );
  }

  return (
    <UserDataContext.Provider
      value={{ userData, setUserData, loading, getCurrentUser, logout }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContextProvider;