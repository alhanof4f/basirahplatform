import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Test from "../../models/Test.js";
import runAI from "../../ai/runAI.js"; // 🔴 معطّل مؤقتًا للنشر

/* ===============================
   🔥 تشغيل الذكاء الاصطناعي لفحص
   (مُعطّل مؤقتًا – Safe for Deploy)
================================ */
export const runTestAI = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "testId غير صالح" });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "الفحص غير موجود" });
    }

    /* ===============================
       مسار الصور (يُستخدم لاحقًا مع AI)
    ================================ */
    const scansPath = path.join(
      process.cwd(),
      "uploads",
      "scans",
      testId
    );

    // 🔴 تشغيل الذكاء الاصطناعي (مُعطّل مؤقتًا)
    const ai = await runAI(scansPath);

    /* ===============================
       قراءة heatmap إن وُجدت (اختياري)
    ================================ */
    const heatmapFile = path.join(
      process.cwd(),
      "uploads",
      "scans",
      testId,
      "gaze_heatmap.png"
    );

    let heatmapBase64 = null;

    if (fs.existsSync(heatmapFile)) {
      const buffer = fs.readFileSync(heatmapFile);
      heatmapBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
    }

    /* ===============================
       نتيجة مؤقتة (بدون AI)
    ================================ */
    test.aiResult = {
  label: ai.label,
  confidence: ai.confidence,
  riskLevel: ai.riskLevel,
  heatmapImage: ai.heatmapImage ?? heatmapBase64,
  gazeStats: ai.gazeStats ?? {},
};


    test.status = "scanned";
    await test.save();

    return res.json({
      success: true,
      message: "تم حفظ الفحص (التحليل معطّل مؤقتًا)",
      aiResult: test.aiResult,
    });
  } catch (error) {
    console.error("runTestAI error:", error);
    res.status(500).json({ message: "فشل معالجة الفحص" });
  }
};

/* ===============================
   إنشاء فحص
================================ */
export const createTest = async (req, res) => {
  try {
    const { patientId, duration = 0, stoppedEarly = false } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "patientId مطلوب" });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "patientId غير صالح" });
    }

    if (!req.doctor?._id || !req.doctor?.center) {
      return res.status(400).json({ message: "الطبيب غير مرتبط بمركز" });
    }

    const test = await Test.create({
      patient: patientId,
      doctor: req.doctor._id,
      center: req.doctor.center,
      type: "eye_tracking",
      status: "scanned",
      duration: Number(duration),
      stoppedEarly: Boolean(stoppedEarly),
    });

    res.status(201).json(test);
  } catch (error) {
    console.error("Create Test Error:", error);
    res.status(500).json({ message: "فشل إنشاء الفحص" });
  }
};

/* ===============================
   إضافة ملاحظة / توصية
================================ */
export const addNoteToTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { text, type = "note" } = req.body;

    if (!text) {
      return res.status(400).json({ message: "النص مطلوب" });
    }

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "testId غير صالح" });
    }

    const test = await Test.findOne({
      _id: testId,
      doctor: req.doctor._id,
    });

    if (!test) {
      return res.status(404).json({ message: "الفحص غير موجود" });
    }

    test.notes.unshift({ text, type });
    await test.save();

    res.json(test.notes);
  } catch (error) {
    console.error("addNoteToTest error:", error);
    res.status(500).json({ message: "فشل إضافة الملاحظة" });
  }
};

/* ===============================
   تقرير الفحص
================================ */
export const getTestReport = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "testId غير صالح" });
    }

    const test = await Test.findOne({
      _id: testId,
      doctor: req.doctor._id,
    })
      .populate("patient")
      .populate("doctor", "name");

    if (!test) {
      return res.status(404).json({ message: "الفحص غير موجود" });
    }

    res.json(test);
  } catch (error) {
    console.error("getTestReport error:", error);
    res.status(500).json({ message: "فشل تحميل التقرير" });
  }
};

/* ===============================
   اعتماد التقرير
================================ */
export const approveTest = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "testId غير صالح" });
    }

    const test = await Test.findOne({
      _id: testId,
      doctor: req.doctor._id,
    });

    if (!test) {
      return res.status(404).json({ message: "الفحص غير موجود" });
    }

    test.status = "approved";
    await test.save();

    res.json({ message: "تم اعتماد التقرير بنجاح ✅", test });
  } catch (error) {
    console.error("approveTest error:", error);
    res.status(500).json({ message: "فشل اعتماد التقرير" });
  }
};

/* ===============================
   فحوصات الطبيب
================================ */
export const getMyTests = async (req, res) => {
  try {
    const tests = await Test.find({
      doctor: req.doctor._id,
      status: { $in: ["approved", "draft"] },
    })
      .populate("patient", "name file_number")
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    console.error("getMyTests error:", error);
    res.status(500).json({ message: "فشل تحميل الفحوصات" });
  }
};

/* ===============================
   فحوصات مريض
================================ */
export const getTestsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "patientId غير صالح" });
    }

    const tests = await Test.find({
      patient: patientId,
      doctor: req.doctor._id,
      status: { $in: ["approved", "draft"] },
    }).sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    console.error("getTestsByPatient error:", error);
    res.status(500).json({ message: "فشل جلب فحوصات المريض" });
  }
};

/* ===============================
   حذف تقرير
================================ */
export const deleteTest = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "testId غير صالح" });
    }

    const test = await Test.findOneAndDelete({
      _id: testId,
      doctor: req.doctor._id,
    });

    if (!test) {
      return res.status(404).json({ message: "التقرير غير موجود" });
    }

    res.json({ message: "تم حذف التقرير بنجاح 🗑️" });
  } catch (error) {
    console.error("deleteTest error:", error);
    res.status(500).json({ message: "فشل حذف التقرير" });
  }
};

/* ===============================
   حفظ التقرير كمسودة
================================ */
export const updateTestStatus = async (req, res) => {
  try {
    const { testId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "testId غير صالح" });
    }

    const test = await Test.findOne({
      _id: testId,
      doctor: req.doctor._id,
    });

    if (!test) {
      return res.status(404).json({ message: "الفحص غير موجود" });
    }

    if (status !== "draft") {
      return res.status(400).json({ message: "حالة غير مدعومة" });
    }

    test.status = "draft";
    await test.save();

    res.json({
      message: "تم حفظ التقرير كمسودة ✅",
      status: test.status,
    });
  } catch (error) {
    console.error("updateTestStatus error:", error);
    res.status(500).json({ message: "فشل حفظ المسودة" });
  }
};
