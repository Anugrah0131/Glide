import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import socketHandler from "./socket/socketHandler.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Exit process with failure if DB connection is critical
    // process.exit(1); 
  }
};

connectDB();

// Middleware
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.get("/", (req, res) => {
  res.send("Socket server running 🚀");
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

  // FUTURE: Inject TURN server details via Environment Variables here
  // if (process.env.TURN_URL) {
  //   iceServers.push({
  //     urls: process.env.TURN_URL,
  //     username: process.env.TURN_USERNAME,
  //     credential: process.env.TURN_PASSWORD
  //   });
  // }

  res.json(iceServers);
});

/*
Socket logic
*/
socketHandler(io);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});