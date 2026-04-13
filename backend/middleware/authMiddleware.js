import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;

export const checkRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};