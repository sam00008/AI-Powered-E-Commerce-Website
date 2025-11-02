import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ✅ CORS Setup
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [
      "https://ai-powered-e-commerce-website-frontend-0e3m.onrender.com",
      "https://ai-powered-e-commerce-website-admin-xyym.onrender.com",
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow server or Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ FIXED LINE

// ✅ Routes
import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/auth", authRouter);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("✅ Backend running successfully!");
});

// ✅ Catch-All 404 Route
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
