import mongoose from "mongoose";

const recruitmentApplicationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruitmentJob",
      required: true
    },
    candidateName: {
      type: String,
      required: true
    },
    candidateEmail: {
      type: String,
      required: true
    },
    candidatePhone: {
      type: String,
      default: ""
    },
    resumeUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offered", "Hired", "Rejected"],
      default: "Applied"
    },
    interviewDate: {
      type: Date,
      default: null
    },
    feedback: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("RecruitmentApplication", recruitmentApplicationSchema);
