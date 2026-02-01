import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="w-64 bg-white shadow p-4">
      <h2 className="font-bold mb-4">Admin</h2>
     <div className="flex flex-col">
     <Link to="/admin/dashboard">Dashboard</Link>
      <Link to="/admin/employees">Employees</Link>
      <Link to="/admin/attendance">Attendance</Link>
      <Link to="/admin/payroll">Payroll</Link>
      <Link to="/admin/departments">Departments</Link>
      <Link to="/admin/leave-requests">Leave Requests</Link>
      <Link to="/admin/reports">Reports</Link>
      <Link to="/admin/settings">Settings</Link>
     </div>
    </div>
  );
};

export default SideBar;
