import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    checkInTime: String,
    checkOutTime: String,

    status: {
      type: String,
      enum: ["present", "late"],
      default: "present"
    },

    location: {
      lat: Number,
      lng: Number,
      accuracy: Number
    }
  },
  { timestamps: true }
);
attendanceSchema.index(
  { companyId: 1, userId: 1, date: 1 },
  { unique: true }
);
export default mongoose.model("Attendance", attendanceSchema);
