import jwt from "jsonwebtoken";
import Company from "../models/Company.model.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check company status/plan for non-superadmins
    if (decoded.role !== "superadmin") {
      if (!decoded.companyId) {
        return res.status(403).json({ message: "Invalid user token configuration" });
      }
      const company = await Company.findById(decoded.companyId);
      if (!company) {
        return res.status(403).json({ message: "Company not found" });
      }
      if (company.status !== "active") {
        return res.status(403).json({ message: "Company account is suspended/inactive" });
      }
      if (company.plan !== "premium") {
        return res.status(403).json({ message: "Premium subscription required to access the system" });
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
