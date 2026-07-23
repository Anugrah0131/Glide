import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string().url("MongoDB URI must be a valid URL"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET is required and must be at least 10 characters"),
});

let envVars;
try {
  envVars = envSchema.parse(process.env);
} catch (err) {
  console.error("❌ Environment Variables Validation Error:");
  if (err instanceof z.ZodError) {
    if (err.issues) {
      err.issues.forEach((e) => console.error(`  - ${e.path.join(".")}: ${e.message}`));
    } else if (err.errors) {
      err.errors.forEach((e) => console.error(`  - ${e.path.join(".")}: ${e.message}`));
    } else {
      console.error(err);
    }
  } else {
    console.error(err);
  }
  process.exit(1);
}

export const env = envVars;
