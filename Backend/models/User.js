import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  password: { 
    type: String, 
    required: true 
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["online", "offline", "guest"],
    default: "offline"
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
