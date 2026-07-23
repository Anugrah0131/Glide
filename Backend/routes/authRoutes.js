import express from "express";
import { register, login, getGuestProfile, getMe, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { registerSchema, loginSchema } from "../utils/validators.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window for auth routes
  message: "Too many authentication attempts, please try again later",
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/guest", authLimiter, getGuestProfile);
router.get("/me", protect, getMe);
router.post("/logout", logout);

export default router;