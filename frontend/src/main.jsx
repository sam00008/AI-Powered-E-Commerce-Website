import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AuthContextProvider from "./context/authContext.jsx";
import UserContextProvider from "./context/UserContext.jsx"; // ✅ Use the correct provider name
import ShopContext from "./context/ShopContext.jsx";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <UserContextProvider>
          <ShopContext>
            <App />
          </ShopContext>
        </UserContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
