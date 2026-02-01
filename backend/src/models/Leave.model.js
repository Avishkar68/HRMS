import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        fromDate: {
            type: String, // YYYY-MM-DD
            required: true
        },

        toDate: {
            type: String,
            required: true
        },

        totalDays: {
            type: Number,
            required: true
        },

        reason: {
            type: String
        },
        leaveTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
