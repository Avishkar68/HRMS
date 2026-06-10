import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Coins, 
  Building2, 
  CalendarClock, 
  BarChart3, 
  Sliders, 
  LogOut,
  FolderOpen,
  Briefcase,
  CheckSquare,
  CalendarRange,
  Award,
  BookOpen
} from "lucide-react";

const SideBar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const navLinkStyle = ({ isActive }) => {
    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border ${
      isActive 
        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10 active:scale-[0.98]" 
        : "text-gray-500 hover:text-gray-950 hover:bg-gray-50 border-transparent"
    }`;
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between flex-shrink-0">
      {/* Upper Brand & Links */}
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-br from-slate-50 to-white">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-gray-950 text-sm tracking-tight leading-none">ADMIN PORTAL</h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Enterprise Console</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5 p-4 pt-6 max-h-[70vh] overflow-y-auto">
          <NavLink to="/admin/dashboard" className={navLinkStyle}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/employees" className={navLinkStyle}>
            <Users className="w-4 h-4" />
            Employees
          </NavLink>
          <NavLink to="/admin/attendance" className={navLinkStyle}>
            <UserCheck className="w-4 h-4" />
            Attendance
          </NavLink>
          <NavLink to="/admin/payroll" className={navLinkStyle}>
            <Coins className="w-4 h-4" />
            Payroll
          </NavLink>
          <NavLink to="/admin/departments" className={navLinkStyle}>
            <Building2 className="w-4 h-4" />
            Departments
          </NavLink>
          <NavLink to="/admin/leave-requests" className={navLinkStyle}>
            <CalendarClock className="w-4 h-4" />
            Leave Requests
          </NavLink>
          <NavLink to="/admin/tasks" className={navLinkStyle}>
            <CheckSquare className="w-4 h-4" />
            Tasks
          </NavLink>
          <NavLink to="/admin/timesheets" className={navLinkStyle}>
            <CalendarRange className="w-4 h-4" />
            Timesheets
          </NavLink>
          <NavLink to="/admin/appraisals" className={navLinkStyle}>
            <Award className="w-4 h-4" />
            Appraisals
          </NavLink>
          <NavLink to="/admin/service-book" className={navLinkStyle}>
            <BookOpen className="w-4 h-4" />
            Service Book
          </NavLink>
          <NavLink to="/admin/reports" className={navLinkStyle}>
            <BarChart3 className="w-4 h-4" />
            Reports
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkStyle}>
            <Sliders className="w-4 h-4" />
            Settings
          </NavLink>
        </nav>
      </div>

      {/* Profile & Logout card */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-150 shadow-sm mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-200 font-extrabold text-xs flex items-center justify-center uppercase shadow-inner">
            {(user.name || "A").substring(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-gray-900 text-xs truncate leading-tight">{user.name || "Administrator"}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate mt-0.5">{user.role || "Admin"}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 text-rose-700 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out Console
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
