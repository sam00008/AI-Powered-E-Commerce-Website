import { useContext } from "react";
import { UserDataContext } from "./UserContext.jsx";

/**
 * useAuth hook for backward compatibility
 * So old imports don't break the app
 */
export const useAuth = () => {
  return useContext(UserDataContext);
};

// Also re-export the context itself if needed
export { UserDataContext as authDataContext };
