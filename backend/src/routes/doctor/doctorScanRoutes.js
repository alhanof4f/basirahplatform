import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Scan from "../../models/Scan.js";

import {
  startScan,
  uploadScanFrame,
  finishScan,
} from "../../controllers/doctor/doctorScanController.js";

const router = express.Router();

/* ==============================
   إعداد multer لحفظ الصور على القرص
============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const scanId = req.params.scanId;

    // حفظ الصور داخل uploads/scans/<scanId>/
    const dir = path.join("uploads", "scans", scanId);
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}.jpg`);
  },
});

const upload = multer({ storage });

/* ==============================
   بدء جلسة فحص
   POST /api/v1/doctor/scan/start
============================== */
router.post("/start", startScan);

/* ==============================
   استقبال صورة من الكاميرا
   POST /api/v1/doctor/scan/:scanId/frame
============================== */
router.post(
  "/:scanId/frame",
  upload.single("frame"),
  uploadScanFrame
);

/* ==============================
   إنهاء الفحص وتشغيل AI
   POST /api/v1/doctor/scan/:scanId/finish
============================== */
router.post("/:scanId/finish", finishScan);

/* ==============================
   جلب بيانات الفحص (Scan) للتقرير
   GET /api/v1/doctor/scan/:scanId
============================== */
router.get("/:scanId", async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.scanId)
      .populate("patient")
      .populate("doctor");

    if (!scan) {
      return res.status(404).json({ message: "Scan غير موجود" });
    }

    res.json(scan);
  } catch (err) {
    console.error("Get Scan error:", err);
    res.status(500).json({ message: "فشل جلب بيانات الفحص" });
  }
});

export default router;
