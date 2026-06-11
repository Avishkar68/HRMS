import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import bcrypt from "bcryptjs";
dotenv.config();

const PORT = process.env.PORT || 3000;

const newPassword = "test123";

const hashedPassword = await bcrypt.hash(newPassword, 10);

console.log(hashedPassword);
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
