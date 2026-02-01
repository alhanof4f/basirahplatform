import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

const doctorAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const doctor = await Doctor.findById(decoded.id)
      .select("_id center")
      .lean();

    if (!doctor) {
      return res.status(401).json({ message: "Doctor not found" });
    }

    // ✅ نثبت كل الصيغ لتفادي أي تعارض
    req.doctor = {
      _id: doctor._id,
      center: doctor.center || null,
    };

    req.doctorId = doctor._id; // 🔑 هذا هو السطر الحاسم

    next();
  } catch (error) {
    console.error("Doctor auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default doctorAuth;
