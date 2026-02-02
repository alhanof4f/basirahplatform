import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ السماح بكل أدوار الأدمن
    if (!decoded.role || !decoded.role.includes("ADMIN")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ هذا هو السطر الأهم
    req.adminId = decoded.id || decoded._id || decoded.adminId;

    if (!req.adminId) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    next();
  } catch (error) {
    console.error("requireAdmin error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}
