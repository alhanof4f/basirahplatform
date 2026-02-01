// doctorAIController.js
export const runTestAI = async (req, res) => {
  const { testId } = req.params;
  const test = await Test.findById(testId);

  if (!test) {
    return res.status(404).json({ message: "Test not found" });
  }

  // ✅ تحقق من عدد الصور
  const imagesCount = test.framesCount || 0;

  if (imagesCount < 60) {
    test.aiResult = {
      label: "Inconclusive",
      asd_ratio: null,
      images: imagesCount,
      final_result: "Inconclusive",
      reason: "Not enough data",
    };
  } else {
    // ✅ نتيجة عرض (Demo-safe)
    test.aiResult = {
      label: "ASD",
      asd_ratio: 0.68,
      images: imagesCount,
      final_result: "High likelihood",
      gazeStats: {
        center: 0.52,
        left: 0.24,
        right: 0.24,
      },
    };
  }

  await test.save();
  res.json(test.aiResult);
};
