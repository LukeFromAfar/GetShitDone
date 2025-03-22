const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
require('dotenv').config();

const verifyJwt = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded token:", decoded);
    
    // Find user by email from the token
    const user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      console.log("Invalid token: User not found");
      return res.status(401).json({ message: "Invalid token" });
    }
    
    console.log("User found:", user);
    req.user = user; // Attach the entire user object to the request
    next();
  } catch (error) {
    console.log("Unauthorized:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = verifyJwt;