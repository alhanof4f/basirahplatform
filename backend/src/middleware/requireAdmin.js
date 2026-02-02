import jwt from "jsonwebtoken";

export default function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ فقط نثبت هوية الأدمن
    req.adminId = decoded.id || decoded._id;
    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
