import express from "express";
import { getDoctorProfile } from "../../controllers/doctor/doctorController.js";
import testRoutes from "./doctorTestRoutes.js";
import { runTestAI } from "../../controllers/doctor/doctorAIController.js";

const router = express.Router();

router.get("/profile", getDoctorProfile);

// تشغيل الذكاء الاصطناعي لفحص محدد
router.post("/tests/:testId/run-ai", runTestAI);

// باقي مسارات الفحوصات
router.use("/tests", testRoutes);

export default router;
