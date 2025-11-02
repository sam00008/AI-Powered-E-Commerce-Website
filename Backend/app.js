import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ✅ Include all frontend origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["https://ai-powered-e-commerce-website-frontend-0e3m.onrender.com", "http://localhost:5174"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // for Postman or server-to-server
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS globally
app.use(cors(corsOptions));


// Routes
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
app.use("/api/v1/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to my Page!");
});

export default app;