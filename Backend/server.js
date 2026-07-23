import "./config/env.js"; // This will validate env vars on startup
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

import socketHandler from "./socket/socketHandler.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { env } from "./config/env.js";

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB Atlas Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://socket-mern-og.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Security and Utility Middleware
app.use(helmet());
app.use(compression());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.get("/", (req, res) => {
  res.send("Socket server running 🚀");
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "UP", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);

// Production Grade: Dynamic Endpoint for STUN/TURN delivery
app.get("/api/ice-servers", (req, res) => {
  // Attach safe CORS headers manually mirroring our Socket config
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.startsWith("http://localhost:"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Base STUN fallback servers
  const iceServers = [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302"
      ]
    }
  ];

  res.json(iceServers);
});

/*
Socket logic
*/
socketHandler(io);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Central Error Handling Middleware
app.use(errorHandler);

const PORT = env.PORT || 3000;

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Graceful Shutdown
const shutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);