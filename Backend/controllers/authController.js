import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { generateUsername } from "../utils/generateUsername.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return next(new AppError("Email already in use", 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      status: "online",
      lastLogin: Date.now()
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isGuest: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGuestProfile = async (req, res, next) => {
  try {
    const userId = `guest_${uuidv4()}`;
    const username = generateUsername();

    res.status(200).json({
      success: true,
      message: "Guest session created successfully",
      token: null,
      user: {
        userId,
        username,
        isGuest: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid credentials", 401));
    }

    user.status = "online";
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        isGuest: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        isGuest: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { status: "offline" });
      } catch (err) {
        // Ignored if token invalid/expired, we just want to attempt to log them out
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};