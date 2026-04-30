import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["policy", "form", "template", "other"],
      default: "other",
    },
    description: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
