import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    yearlyQuota: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);
