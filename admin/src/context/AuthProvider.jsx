import React, { createContext } from "react";

// ✅ Export with consistent naming
export const authDataContext = createContext();

const AuthProvider = ({ children }) => {
  const serverUrl = "http://localhost:3000";

  const value = { serverUrl };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
};

export default AuthProvider;
