import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import SuperAdmin from "../src/models/SuperAdmin.model.js";
import dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("superadmin123", 10);

  await SuperAdmin.create({
    email: "superadmin@hrms.com",
    passwordHash: hashedPassword
  });

  console.log("Super Admin Created");
  process.exit();
};

createSuperAdmin();
