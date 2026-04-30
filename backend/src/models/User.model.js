import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      required: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1, email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
