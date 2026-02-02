import axios from "axios";

export async function runAI(imagesPath, testId) {
  try {
    const AI_URL = process.env.AI_SERVICE_URL;
    if (!AI_URL) throw new Error("AI_SERVICE_URL not set");

    const { data } = await axios.post(
      `${AI_URL}/analyze`,
      {
        frames_path: imagesPath,
        test_id: testId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 1000 * 60 * 5,
      }
    );

    const raw = data?.result ?? data;

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
