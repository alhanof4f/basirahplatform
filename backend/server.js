import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import fileUpload from "express-fileupload";

/* ======================
   Routes
====================== */
// Admin
import adminRoutes from "./src/routes/admin/index.js";
import adminPaymentRoutes from "./src/routes/admin/payment.routes.js";

// Doctor
import doctorRoutes from "./src/routes/doctor/index.js";

// Center
import centerRoutes from "./src/routes/center/index.js";
import centerAuthRoutes from "./src/routes/center/auth.routes.js";

// Sessions (🔒 لا نكسره)
import sessionRoutes from "./src/routes/center/session.routes.js";

/* ======================
   Config
====================== */
dotenv.config();

/* ======================
   App Init
====================== */
const app = express();

/* ======================
   Security & Logs
====================== */
app.use(helmet());
app.use(morgan("dev"));

/* ======================
   CORS (آمن + Local + Vercel)
====================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://basirah-final.vercel.app",
];

const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        vercelPreviewRegex.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// مهم جدًا للـ preflight
app.options("*", cors());

/* ======================
   Body & Uploads
====================== */
app.use(express.json());
app.use(fileUpload()); // مرة وحدة فقط

/* ======================
   Static Files
====================== */
app.use("/uploads", express.static("uploads"));

/* ======================
   Health Check
====================== */
app.get("/", (req, res) => {
  res.send("Basira Backend Running 🚀");
});

/* ======================
   API Routes
====================== */

// Admin
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/payments", adminPaymentRoutes);

// Doctor
app.use("/api/v1/doctor", doctorRoutes);

// Center
app.use("/api/v1/center/auth", centerAuthRoutes);
app.use("/api/v1/center", centerRoutes);

// Sessions (خاص بالفحص / التصوير)
app.use("/api/v1/sessions", sessionRoutes);

/* ======================
   MongoDB
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ======================
   404 Handler (API فقط)
====================== */
app.use("/api", (req, res) => {
  res.status(404).json({
    message: `API Route not found: ${req.originalUrl}`,
  });
});

/* ======================
   Global Error Handler
====================== */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

/* ======================
   Server
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
