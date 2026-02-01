import express from "express";
import authCenter from "../middleware/authCenter.js";

import { getCenterDashboard } from "../controllers/center/centerDashboardController.js";
import { listCenterDoctors } from "../controllers/center/centerDoctorController.js";
import { listCenterPatients } from "../controllers/center/centerPatientController.js";
import { getMySubscription } from "../controllers/center/centerSubscriptionController.js";
import { getCenterSettings, updateCenterSettings } from "../controllers/center/centerSettingsController.js";

const router = express.Router();

// 🔐 حماية كل مسارات السنتر
router.use(authCenter);

router.get("/dashboard", getCenterDashboard);
router.get("/doctors", listCenterDoctors);
router.get("/patients", listCenterPatients);
router.get("/subscription", getMySubscription);
router.get("/settings", getCenterSettings);
router.put("/settings", updateCenterSettings);

export default router;
