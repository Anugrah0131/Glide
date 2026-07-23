import { AppError } from "../utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  const errors = err.errors || [];

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: errors,
      stack: err.stack,
    });
  } else {
    // Production
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: errors,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error("ERROR 💥", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: [],
      });
    }
  }
};
