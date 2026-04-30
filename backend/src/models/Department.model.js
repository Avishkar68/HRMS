import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      default: "",
    },
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

departmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

export default mongoose.model("Department", departmentSchema);
