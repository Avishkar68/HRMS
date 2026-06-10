import mongoose from "mongoose";

const serviceBookSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        "Appointment",
        "Promotion",
        "Transfer",
        "Increment",
        "Leave",
        "Award",
        "Disciplinary",
        "Separation",
        "Other"
      ],
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    salaryDetails: {
      type: String,
      default: ""
    },
    officeOrderNumber: {
      type: String,
      required: true
    },
    remarks: {
      type: String,
      default: ""
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Optimize lookups by employee and cycle order
serviceBookSchema.index({ companyId: 1, userId: 1, eventDate: -1 });

export default mongoose.model("ServiceBook", serviceBookSchema);
