import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
    },

    stoppedEarly: {
      type: Boolean,
      default: false,
    },

    aiResult: {
  summary: String,

  indicators: {
    behavioralLikelihoodLevel: String,
    confidenceScore: Number,
    eyeTrackingImagesAnalyzed: Number,
  },

  metrics: {
    likelihoodPercentage: Number,
  },

  gazeStats: {
    center: Number,
    left: Number,
    right: Number,
  },

  heatmapImage: String,
},


  },
  { timestamps: true }
);

export default mongoose.model("Scan", scanSchema);
