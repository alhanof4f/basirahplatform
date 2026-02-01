import jwt from "jsonwebtoken";
import Center from "../models/Center.js";

export default async function authCenter(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 التصحيح هنا
    const centerId = decoded.centerId || decoded.id;

    if (!centerId) {
      return res.status(401).json({ message: "Center not found" });
    }

    const center = await Center.findById(centerId);

    if (!center) {
      return res.status(401).json({ message: "Center not found" });
    }

    // نخزن الاثنين للأمان
    req.center = center;
    req.centerId = center._id;

    next();
  } catch (error) {
    console.error("authCenter error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
}
