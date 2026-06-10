import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===== AUTH GUARDS ===== */
import RequireRole from "./components/auth/RequireRole";

/* ===== PUBLIC PAGES ===== */
import Signin from "./pages/public/Signin/Signin";
import Signup from "./pages/public/Signup/Signup";
import SuperAdminLogin from "./pages/public/SuperAdminLogin/SuperAdminLogin";

/* ===== EMPLOYEE ===== */
import EmployeePage from "./pages/employee/EmployeePage/EmployeePage";
import ApplyLeave from "./pages/employee/ApplyLeave/ApplyLeave";
import MyAttendance from "./pages/employee/MyAttendance/Attendance";
import MyProfile from "./pages/employee/MyProfile/Profile";
import PaySlips from "./pages/employee/PaySlips/PaySlips";

/* ===== MANAGER ===== */
import ManagerPage from "./pages/manager/ManagePage/ManagerPage";
import ApproveLeaves from "./pages/manager/ApproveLeaves/ApproveLeaves";
import TeamAttendance from "./pages/manager/TeamAttendance/TeamAttendance";
import TeamDashboard from "./pages/manager/TeamDashboard/TeamDashboard";
import ManagerTeam from "./pages/manager/Team/ManagerTeam";

/* ===== ADMIN ===== */
import AdminPage from "./pages/admin/AdminPage/AdminPage";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Employees from "./pages/admin/Employees/Employees";
import Attendance from "./pages/admin/Attendance/Attendance";
import Payroll from "./pages/admin/Payroll/Payroll";
import Departments from "./pages/admin/Departments/Departments";
import Documents from "./pages/admin/Documents/Documents";
import LeaveRequests from "./pages/admin/LeaveRequests/LeaveRequests";
import Reports from "./pages/admin/Reports/Reports";
import Settings from "./pages/admin/Settings/Settings";

/* ===== TASKS ===== */
import EmployeeTasks from "./pages/employee/Tasks/EmployeeTasks";
import ManagerTasks from "./pages/manager/Tasks/ManagerTasks";
import AdminTasks from "./pages/admin/Tasks/AdminTasks";

/* ===== TIMESHEETS ===== */
import EmployeeTimesheets from "./pages/employee/Timesheets/EmployeeTimesheets";
import ManagerTimesheets from "./pages/manager/Timesheets/ManagerTimesheets";
import AdminTimesheets from "./pages/admin/Timesheets/AdminTimesheets";

/* ===== APPRAISALS ===== */
import EmployeeAppraisals from "./pages/employee/Appraisals/EmployeeAppraisals";
import ManagerAppraisals from "./pages/manager/Appraisals/ManagerAppraisals";
import AdminAppraisals from "./pages/admin/Appraisals/AdminAppraisals";

/* ===== SERVICE BOOK ===== */
import EmployeeServiceBook from "./pages/employee/ServiceBook/EmployeeServiceBook";
import ManagerServiceBook from "./pages/manager/ServiceBook/ManagerServiceBook";
import AdminServiceBook from "./pages/admin/ServiceBook/AdminServiceBook";

/* ===== SUPER ADMIN ===== */
import SuperAdminPage from "./pages/superadmin/SuperAdminPage/SuperAdminPage";
import Companies from "./pages/superadmin/Companies/Companies";
import CreateCompany from "./pages/superadmin/CreateCompany/CreateCompany";
import SubscriptionStatus from "./pages/superadmin/SubscriptionStatus/SubscriptionStatus";
import UsageStatus from "./pages/superadmin/UsageStatus/UsageStatus";
import MarkAttendance from "./pages/employee/MyAttendance/MarkAttendance";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* ================= PUBLIC ================= */}
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* ================= EMPLOYEE ================= */}
        <Route
          path="/employee"
          element={
            <RequireRole allowedRoles={["employee"]}>
              <EmployeePage />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="attendance/mark" element={<MarkAttendance />} />
          <Route path="apply-leave" element={<ApplyLeave />} />
          <Route path="payslips" element={<PaySlips />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="timesheets" element={<EmployeeTimesheets />} />
          <Route path="appraisals" element={<EmployeeAppraisals />} />
          <Route path="service-book" element={<EmployeeServiceBook />} />
        </Route>

        {/* ================= MANAGER ================= */}
        <Route
          path="/manager"
          element={
            <RequireRole allowedRoles={["manager"]}>
              <ManagerPage />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeamDashboard />} />
          <Route path="team-attendance" element={<TeamAttendance />} />
          <Route path="approve-leaves" element={<ApproveLeaves />} />
          <Route path="tasks" element={<ManagerTasks />} />
          <Route path="team" element={<ManagerTeam />} />
          <Route path="timesheets" element={<ManagerTimesheets />} />
          <Route path="appraisals" element={<ManagerAppraisals />} />
          <Route path="service-book" element={<ManagerServiceBook />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <AdminPage />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="departments" element={<Departments />} />
          <Route path="documents" element={<Documents />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="timesheets" element={<AdminTimesheets />} />
          <Route path="appraisals" element={<AdminAppraisals />} />
          <Route path="service-book" element={<AdminServiceBook />} />
        </Route>

        {/* ================= SUPER ADMIN ================= */}
        <Route
          path="/superadmin"
          element={
            <RequireRole allowedRoles={["superadmin"]}>
              <SuperAdminPage />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="companies" replace />} />
          <Route path="companies" element={<Companies />} />
          <Route path="create-company" element={<CreateCompany />} />
          <Route path="subscription-status" element={<SubscriptionStatus />} />
          <Route path="usage-status" element={<UsageStatus />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/signin" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
