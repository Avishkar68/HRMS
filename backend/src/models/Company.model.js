import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    logoUrl: String,
    domain: String,
    plan: {
      type: String,
      enum: ["basic", "premium"],
      default: "basic"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
