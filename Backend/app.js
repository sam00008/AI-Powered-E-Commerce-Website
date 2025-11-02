import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Body parsing & cookies
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ✅ Allowed origins (Frontend + Admin + Local)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [
      "https://ai-powered-e-commerce-website-frontend-0e3m.onrender.com",
      "https://ai-powered-e-commerce-website-admin-xyym.onrender.com",
      "http://localhost:5173",
      "http://localhost:5174",
    ];

// ✅ CORS setup (simplified & production-safe)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies across domains
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Allow browsers to handle preflight requests properly
app.options("*", cors());

// ✅ Routes
import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/auth", authRouter);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully!");
});

export default app;
