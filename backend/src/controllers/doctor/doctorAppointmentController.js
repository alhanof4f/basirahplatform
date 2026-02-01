import Appointment from "../../models/Appointment.js";

export const getMyAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const { filter } = req.query;

    const now = new Date();

    let query = { doctor: doctorId };

    if (filter === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    }

    if (filter === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      query.date = { $gte: start, $lt: end };
    }

    if (filter === "upcoming") {
      query.date = { $gte: now };
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "name file_number")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("getMyAppointments error:", error);
    res.status(500).json({ message: "فشل جلب المواعيد" });
  }
};
