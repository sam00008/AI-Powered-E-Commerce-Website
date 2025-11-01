import { useState, useEffect, useContext, createContext } from "react";
// 💡 Import your new api instance
import api from "../api.js"; 
// 🛑 No need to import axios directly anymore
// 🛑 No need for authDataContext just to get serverUrl

export const UserDataContext = createContext();

function UserContextProvider({ children }) {
    const [userData, setUserData] = useState(null);

    const getCurrentUser = async () => {
        try {
            // 💡 Use `api.get` instead of `axios.get`
            // The path is now relative to the baseURL in api.js
            const res = await api.get("/auth/current-user");

            if (res.data && res.data.data.user) { // ✅ Match ApiResponse structure
                setUserData(res.data.data.user);
            } else {
                setUserData(null);
            }
        } catch (error) {
            // This catch block will now only run if the token REFRESH fails
            setUserData(null);
            console.error(
                "Error fetching current user (refresh likely failed):",
                error.response?.data || error.message
            );
        }
    };

    const logout = async () => {
        try {
            // 💡 Use `api.post`
            await api.post("/auth/logout");
            setUserData(null);
            alert("Logged out successfully!");
        } catch (error) {
            console.error(
                "Error logging out:",
                error.response?.data || error.message
            );
            // Even if it fails, log out locally
            setUserData(null); 
            alert("Logout failed on server, logging out locally.");
        }
    };

    useEffect(() => {
        getCurrentUser();
    }, []);

    return (
        <UserDataContext.Provider
            value={{ userData, setUserData, getCurrentUser, logout }}
        >
            {children}
        </UserDataContext.Provider>
    );
}

export default UserContextProvider;