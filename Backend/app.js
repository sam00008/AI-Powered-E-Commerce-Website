import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// 1. Increase limit for JSON
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// 2. CORS Configuration
// specific origins are safer for credentials
const allowedOrigins = [
  "https://ai-powered-e-commerce-website-frontend-0e3m.onrender.com",
  "https://ai-powered-e-commerce-website-admin-xyym.onrender.com",
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // If specific origin check fails, you can allow all for dev, 
      // but for production stick to the array.
      // For now, let's strictly allow from array or return error
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true, // IMPORTANT: Allows cookies to be sent/received
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], 
}));

// Routes
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import cartRouter from "./routes/cart.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;