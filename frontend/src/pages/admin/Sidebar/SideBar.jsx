import { NavLink } from "react-router-dom";

const navClass = "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";
const activeClass = "bg-indigo-50 text-indigo-700";
const inactiveClass = "text-gray-700 hover:bg-gray-100";

const SideBar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-lg">Admin</h2>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Dashboard</NavLink>
        <NavLink to="/admin/employees" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Employees</NavLink>
        <NavLink to="/admin/attendance" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Attendance</NavLink>
        <NavLink to="/admin/payroll" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Payroll</NavLink>
        <NavLink to="/admin/departments" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Departments</NavLink>
        <NavLink to="/admin/leave-requests" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Leave Requests</NavLink>
        <NavLink to="/admin/reports" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Reports</NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Settings</NavLink>
      </nav>
    </aside>
  );
};

export default SideBar;
