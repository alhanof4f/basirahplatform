import axios from "axios";

export async function runAI(imagesPath, testId) {
  try {
    const AI_URL = process.env.AI_SERVICE_URL; // https://basirah-ai.up.railway.app
    if (!AI_URL) throw new Error("AI_SERVICE_URL not set");

    // ✅ نرسل المسار فقط (مثل ما FastAPI متوقع)
    const payload = {
      frames_path: imagesPath,
      test_id: testId,
    };

    const { data } = await axios.post(
      `${AI_URL}/analyze`,
      payload,
      {
        timeout: 1000 * 60 * 5, // 5 دقائق
      }
    );

    const raw = data?.result;

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
    console.error(
      "AI SERVICE ERROR:",
      error?.response?.data || error.message
    );

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
