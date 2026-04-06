import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Handle common frontend bugs (sending literally "null" or "undefined" as a string)
      if (!token || token === "null" || token === "undefined") {
        console.warn("Auth Middleware: Token is empty or literal 'null'/'undefined'.");
        return res.status(401).json({ message: "Not authorized, no valid token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.warn(`Auth Middleware: User with ID ${decoded.id} not found.`);
        return res.status(401).json({ message: "Not authorized, user no longer exists" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.name, "-", error.message);
      const message = error.name === "TokenExpiredError" ? "Session expired, please login again" : "Not authorized, token failed";
      return res.status(401).json({ message });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};