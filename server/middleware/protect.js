import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract just the token part after "Bearer "
      token = req.headers.authorization.split(" ")[1];

      // Verify the token — throws an error if expired or tampered with
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to the request (minus the password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // token is valid, let the request continue
    } catch (error) {
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

export default protect;