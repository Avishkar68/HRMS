import { NavLink } from "react-router-dom";

const navClass = "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";
const activeClass = "bg-indigo-50 text-indigo-700";
const inactiveClass = "text-gray-700 hover:bg-gray-100";

const SideBar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-lg">Employee</h2>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        <NavLink to="/employee/profile" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>My Profile</NavLink>
        <NavLink to="/employee/attendance/mark" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Mark Attendance</NavLink>
        <NavLink to="/employee/attendance" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>View Attendance</NavLink>
        <NavLink to="/employee/apply-leave" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Apply Leave</NavLink>
        <NavLink to="/employee/payslips" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Pay Slips</NavLink>
      </nav>
    </aside>
  );
};

export default SideBar;
