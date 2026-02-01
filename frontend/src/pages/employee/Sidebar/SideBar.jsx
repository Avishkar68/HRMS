import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="w-64 bg-white shadow p-4">
      <h2 className="font-bold mb-4">Employee</h2>

      <nav className="flex flex-col gap-2">
        <Link to="/employee/profile">My Profile</Link>
        <Link to="/employee/attendance/mark">Mark Attendance</Link>
        <Link to="/employee/attendance">View Attendance</Link>
        <Link to="/employee/apply-leave">Apply Leave</Link>
        <Link to="/employee/payslips">Pay Slips</Link>
      </nav>
    </div>
  );
};

export default SideBar;
