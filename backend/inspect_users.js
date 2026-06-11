import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/models/User.model.js";
import Company from "./src/models/Company.model.js";

dotenv.config({ path: "./.env" });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const companies = await Company.find().lean();
    console.log("\n--- COMPANIES ---");
    console.log(companies);

    const users = await User.find().lean();
    console.log("\n--- USERS ---");
    for (const u of users) {
      const cmp = companies.find(c => c._id.toString() === u.companyId?.toString());
      console.log(`User: ${u.name} | Email: ${u.email} | Role: ${u.role} | Status: ${u.status} | Company: ${cmp ? cmp.name : "None"} (${cmp ? cmp.plan : "None"})`);

      // Test comparing with default passwords (like "admin123" or "password123")
      const testPasswords = ["admin123", "password123", "superadmin123"];
      for (const tp of testPasswords) {
        const match = await bcrypt.compare(tp, u.passwordHash);
        if (match) {
          console.log(`  -> Password matches "${tp}"`);
        }
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
