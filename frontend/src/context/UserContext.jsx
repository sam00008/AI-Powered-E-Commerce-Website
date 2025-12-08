import { useState, useEffect, createContext } from "react";
import api from "../api.js"; // Import the axios instance we created in Step 2

export const UserDataContext = createContext();

function UserContextProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/current-user");
      
      if (res.data?.data?.user) {
        setUserData(res.data.data.user);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.log("Not logged in or session expired.");
      setUserData(null);
    } finally {
      setLoading(false); // ✅ Stop loading regardless of success/fail
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUserData(null);
    } catch (error) {
      console.error("Logout failed", error);
      setUserData(null); // Clear locally anyway
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <UserDataContext.Provider
      value={{ userData, setUserData, loading, getCurrentUser, logout }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContextProvider;