const jwt = require("jsonwebtoken");
////////////////////////////////////////////////////////
const jwtAuthMiddleware = (req, res, next) => {
  // const authorization = req.headers.authorization
  // if (!authorization) {
  //   return res.status(401).json({error:"token not found"})
  // }
  // extract the jwt token
  // const token = req.headers.authorization.split(" ")[1];
  // if (!token) {
  //   return res.status(401).json({ error: "unauthorized" });
  // }
  // Check if cookies exist
  if (!req.cookies || !req.cookies.token) {
    return res.status(401).json({ error: "Unauthorized: Token not found" });
  }
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: token not found" });
  }
  try {
    // verify jwt token
    const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
    req.userPayload = decodedValue;
    next();
  } catch (error) {
    res.status(500).json({
      error: "Invalid token",
      details: error.message,
    });
  }
};
///////////////////////////////////////////////////////
// function to generate JWT Token
const generateToken = (userData) => {
  // generate a new JWT token using user data
  return jwt.sign(userData, process.env.JWT_SECRET);
};
module.exports = { jwtAuthMiddleware, generateToken };

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTkyM2E5MWRhMzRjNjUyMGQyMjE0NyIsInVzZXJuYW1lIjoiYyIsImlhdCI6MTcyMjM2MDc0NX0.UExAa7VtF4qX22Mxso5tHLL2AEaq2dmLdt7uxUhsULc
