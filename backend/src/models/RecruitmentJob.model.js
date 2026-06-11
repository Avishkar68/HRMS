import mongoose from "mongoose";

const recruitmentJobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    location: {
      type: String,
      default: "Remote"
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time"
    },
    description: {
      type: String,
      required: true
    },
    requirements: {
      type: String,
      default: ""
    },
    salaryRange: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Active", "Draft", "Closed"],
      default: "Active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("RecruitmentJob", recruitmentJobSchema);
