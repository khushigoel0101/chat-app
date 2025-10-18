import jwt from "jsonwebtoken";
import User from "../models/User.js";

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("ProtectRoute Error:", err.message);

    // ✅ Correct way to handle JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};
