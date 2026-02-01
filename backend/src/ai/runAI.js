// backend/src/ai/runAI.js
import axios from "axios";

export async function runAI(imagesPath, testId) {
  try {
    const AI_URL = "http://127.0.0.1:8000/analyze";

    const response = await axios.post(
      AI_URL,
      {
        frames_path: imagesPath,
        test_id: testId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 1000 * 60 * 5, // 5 دقائق
      }
    );

    const raw = response.data?.result;

    // 🔴 أمان: لو ما رجع شيء
    if (!raw) {
      return {
        label: "Inconclusive",
        confidence: null,
        riskLevel: "Unknown",
        heatmapImage: null,
        gazeStats: {},
        raw: null,
      };
    }

    // عدد الصور قليل → نفس منطقك القديم
    if (!raw.images || raw.images === 0) {
      return {
        label: "Inconclusive",
        confidence: null,
        riskLevel: "Unknown",
        heatmapImage: null,
        gazeStats: {},
        raw,
      };
    }

    const ratio =
      typeof raw.asd_ratio === "number" ? raw.asd_ratio : null;

    let label = "Inconclusive";
    let riskLevel = "Medium";

    if (ratio !== null) {
      if (ratio >= 0.7) {
        label = "ASD";
        riskLevel = "High";
      } else if (ratio <= 0.3) {
        label = "Normal";
        riskLevel = "Low";
      }
    }

    return {
      label,
      confidence: ratio,
      riskLevel,
      heatmapImage: raw.heatmap_path ?? null,
      gazeStats: raw.gaze_stats ?? {},
      raw,
    };
  } catch (error) {
    console.error("AI SERVICE ERROR:", error?.response?.data || error.message);

    return {
      label: "Inconclusive",
      confidence: null,
      riskLevel: "Unknown",
      heatmapImage: null,
      gazeStats: {},
      raw: null,
    };
  }
}
