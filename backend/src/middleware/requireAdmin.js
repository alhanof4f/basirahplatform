import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ يدعم SUPER_ADMIN بدون كسر بقية الصفحات
    if (!decoded.role || !decoded.role.includes("ADMIN")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ هذا السطر هو مفتاح حل مشكلة settings
    req.adminId = decoded.id || decoded._id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
