import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthProvider.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // ✅ 1. Import axios

// ✅ 2. Set axios to send credentials (cookies) with all requests
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <ToastContainer position="top-right" autoClose={2000} />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);