import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export async function runAI(imagesPath, testId) {
  try {
    const AI_URL = process.env.AI_SERVICE_URL; // مثال: https://basirah-ai.up.railway.app
    if (!AI_URL) throw new Error("AI_SERVICE_URL not set");

    /* =========================
       قراءة الفريمات
    ========================= */
    const files = fs
      .readdirSync(imagesPath)
      .filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

    if (files.length === 0) {
      return {
        label: "Inconclusive",
        confidence: null,
        riskLevel: "Unknown",
        heatmapImage: null,
        gazeStats: {},
        raw: null,
      };
    }

    /* =========================
       تجهيز FormData
    ========================= */
    const form = new FormData();

    for (const file of files) {
      form.append(
        "frames", // 🔥 مهم: لازم يطابق FastAPI
        fs.createReadStream(path.join(imagesPath, file)),
        file
      );
    }

    form.append("test_id", testId);

    /* =========================
       إرسال الطلب للـ AI Service
    ========================= */
    const { data } = await axios.post(
      `${AI_URL}/analyze`,
      form,
      {
        headers: form.getHeaders(),
        timeout: 1000 * 60 * 5, // 5 دقائق
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
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

    /* =========================
       منطق النتيجة
    ========================= */
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
