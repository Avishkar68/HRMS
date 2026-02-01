import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("SuperAdmin", superAdminSchema);
