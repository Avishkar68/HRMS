import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
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
      default: null
    },
    date: {
      type: Date,
      required: true
    },
    hours: {
      type: Number,
      required: true,
      min: 1,
      max: 24
    },
    project: {
      type: String,
      default: "General"
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectionReason: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Timesheet", timesheetSchema);
