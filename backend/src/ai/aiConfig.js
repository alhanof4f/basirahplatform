// backend/src/ai/aiConfig.js
import path from "path";

// جذر مشروع بصيرة (backend)
const BASE_DIR = path.resolve();

// نحدد Python من نفس مشروع بصيرة
export const PYTHON_PATH = path.join(
  BASE_DIR,
  ".venv",
  "bin",
  "python"
);

// نحدد ملف الذكاء الاصطناعي بشكل صريح
export const AI_SCRIPT = path.join(
  BASE_DIR,
  "src",
  "ai",
  "ai_inference.py"
);
