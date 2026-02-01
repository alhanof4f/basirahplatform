import Test from "../../models/Test.js";
import Patient from "../../models/Patient.js";
import Appointment from "../../models/Appointment.js"; // ✅ جديد

export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const centerId = req.doctor.center;

    /* =========================
       عدد المرضى (من المركز)
    ========================= */
    const patientsCount = await Patient.countDocuments({
      center: centerId,
    });

    /* =========================
       الفحوصات المعتمدة للطبيب
    ========================= */
    const approvedTests = await Test.find({
      doctor: doctorId,
      status: "approved",
    })
      .populate("patient", "name file_number")
      .sort({ createdAt: -1 })
      .limit(5);

    /* =========================
       عدد المواعيد (جديد)
    ========================= */
    const appointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
    });

    /* =========================
       عدد مواعيد اليوم (اختياري)
    ========================= */
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({
      patientsCount,
      completedTests: approvedTests.length,

      // ✅ هذه هي اللي تربط الداشبورد بالمواعيد
      appointmentsCount,
      todayAppointments, // (لو حابة تستخدمينه لاحقًا)

      latestTests: approvedTests.map((t) => ({
        _id: t._id,
        patientName: t.patient?.name || "—",
        fileNumber: t.patient?.file_number || "—",
        date: t.createdAt,
        status: t.status,
      })),
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    res.status(500).json({
      message: "تعذر تحميل بيانات لوحة التحكم",
    });
  }
};
