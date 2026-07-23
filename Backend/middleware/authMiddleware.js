import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

// Standalone function for socket and other use cases
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Express Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized, no token", 401));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new AppError("Not authorized, token failed", 401));
    }

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return next(new AppError("Not authorized, user not found", 401));
    }

    next();
  } catch (error) {
    next(new AppError("Not authorized, token failed", 401));
  }
};