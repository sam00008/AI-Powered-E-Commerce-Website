import React, { useState, useEffect, createContext, useCallback } from "react";
import api from "../api.js"; // Import your configured Axios instance

export const UserDataContext = createContext();

function UserContextProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Wrap getCurrentUser in useCallback to stabilize it
  const getCurrentUser = useCallback(async () => {
    // We set loading to true here to ensure any component consuming the context
    // knows we are checking the session status.
    setLoading(true); 
    
    try {
      // Use the configured api instance (which includes the refresh token logic)
      const res = await api.get("/auth/current-user"); 

      if (res.data?.data?.user) {
        setUserData(res.data.data.user);
      } else {
        // This should theoretically be unreachable if the interceptor works, 
        // but it's safe to keep.
        setUserData(null);
      }
    } catch (error) {
      // The interceptor handles the 401 redirect, 
      // but if the interceptor fails or logs out, we still ensure local state is null.
      console.log("Not logged in or session check failed.");
      setUserData(null);
    } finally {
      // 2. Crucial: Always set loading to false in finally block
      setLoading(false); 
    }
  }, []); // Empty dependency array ensures this function is created once

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