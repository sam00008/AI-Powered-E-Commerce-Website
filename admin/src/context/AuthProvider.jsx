import React, { createContext } from "react";

// ✅ Export with consistent naming
export const authDataContext = createContext();

const AuthProvider = ({ children }) => {
  const serverUrl = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

  const value = { serverUrl };

  return (
    <authDataContext.Provider value={value}>
      {children}
    </authDataContext.Provider>
  );
};

export default AuthProvider;
