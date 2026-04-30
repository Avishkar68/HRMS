import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import adminManagerRoutes from "./routes/adminManager.routes.js"
import adminAttendanceRoutes from "./routes/adminAttendance.routes.js";
import managerAttendanceRoutes from "./routes/managerAttendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import managerLeaveRoutes from "./routes/managerLeave.routes.js";
import adminLeaveRoutes from "./routes/adminLeave.routes.js";
import leaveTypeRoutes from "./routes/leaveType.routes.js";
import leaveBalanceRoutes from "./routes/leaveBalance.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import documentRoutes from "./routes/document.routes.js";
import adminReportsRoutes from "./routes/adminReports.routes.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminManagerRoutes);
app.use("/api/admin", adminAttendanceRoutes);
app.use("/api/manager", managerAttendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/manager", managerLeaveRoutes);
app.use("/api/admin", adminLeaveRoutes);
app.use("/api/admin", leaveTypeRoutes);
app.use("/api/leave", leaveBalanceRoutes);
app.use("/api/admin/departments", departmentRoutes);
app.use("/api/admin/documents", documentRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/payroll", payrollRoutes);

export default app;
