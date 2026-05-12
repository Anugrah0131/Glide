import express from "express";
import { register, login, getGuestProfile, getMe, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/guest", getGuestProfile);
router.get("/me", protect, getMe);
router.post("/logout", logout);

export default router;