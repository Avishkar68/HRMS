import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    total: Number,
    used: {
      type: Number,
      default: 0
    },

    remaining: Number
  },
  { timestamps: true }
);

export default mongoose.model("LeaveBalance", leaveBalanceSchema);
