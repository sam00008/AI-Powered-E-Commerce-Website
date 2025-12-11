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

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS Not Allowed: " + origin), false);
      }

      // IMPORTANT: must explicitly ALLOW the origin
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

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