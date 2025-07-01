const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to authenticate JWT tokens from cookies or Authorization header
const jwtAuthMiddleware = (req, res, next) => {
  // Try to get token from:
  // 1. Cookies (for browser-based requests)
  // 2. Authorization header (for API clients)
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      details: err.message,
    });
  }
};

// Generate a JWT token with optional expiration
const generateToken = (userData, expiresIn = "1d") => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn });
};

// Clear JWT cookie (for logout)
const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

module.exports = {
  jwtAuthMiddleware,
  generateToken,
  clearTokenCookie,
};
