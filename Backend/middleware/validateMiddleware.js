import { z } from "zod";
import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }));
      return next(new AppError("Validation failed", 400, formattedErrors));
    }
    next(err);
  }
};
