import path from "path";
import fs from "fs";
import Test from "../../models/Test.js";
import { runAI } from "../../ai/runAI.js";

export const runTestAI = async (req, res) => {
  try {
    const { testId } = req.params;

    // 1️⃣ تأكد أن الفحص موجود
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // 2️⃣ مسار صور الفحص
    const imagesPath = path.join(
      process.cwd(),
      "uploads",
      "scans",
      testId
    );

    // 3️⃣ تحقق أن الصور موجودة
    if (!fs.existsSync(imagesPath)) {
      return res.status(400).json({
        message: "No scan images found for this test",
      });
    }

    // 4️⃣ تشغيل الذكاء الاصطناعي
    const aiResult = await runAI(imagesPath);

    // 5️⃣ حفظ النتيجة في قاعدة البيانات
    test.aiResult = aiResult;
    test.aiStatus = "completed";
    await test.save();

    // 6️⃣ إرجاع النتيجة للطبيب
    res.json({
      success: true,
      aiResult,
    });

  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
};
