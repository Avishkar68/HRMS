import mongoose from "mongoose";

const appraisalSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    period: {
      type: String,
      required: true
    },
    ratings: {
      performance: { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, required: true, min: 1, max: 5 },
      teamwork: { type: Number, required: true, min: 1, max: 5 },
      punctuality: { type: Number, required: true, min: 1, max: 5 }
    },
    managerFeedback: {
      type: String,
      required: true
    },
    selfEvaluation: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending-employee-feedback", "completed"],
      default: "pending-employee-feedback"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Appraisal", appraisalSchema);
