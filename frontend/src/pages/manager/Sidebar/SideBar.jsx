import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserCheck, 
  CalendarDays,
  LogOut,
  ShieldAlert,
  CheckSquare,
  Users,
  CalendarRange,
  Award,
  BookOpen,
  X,
  Briefcase
} from "lucide-react";

const SideBar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    if (onClose) onClose();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navLinkStyle = ({ isActive }) => {
    return `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all border ${
      isActive 
        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10 active:scale-[0.98]" 
        : "text-gray-500 hover:text-gray-950 hover:bg-gray-50 border-transparent"
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Upper Navigation block */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-gray-955 text-sm tracking-tight leading-none">PORTAL MANAGER</h2>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workspace Access</span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-450 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 p-4 pt-6 flex-1 overflow-y-auto min-h-0">
            <NavLink to="/manager/dashboard" className={navLinkStyle} onClick={handleLinkClick}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink to="/manager/team-attendance" className={navLinkStyle} onClick={handleLinkClick}>
              <UserCheck className="w-4 h-4" />
              Team Roster
            </NavLink>
            <NavLink to="/manager/team" className={navLinkStyle} onClick={handleLinkClick}>
              <Users className="w-4 h-4" />
              My Team
            </NavLink>
            <NavLink to="/manager/recruitment" className={navLinkStyle} onClick={handleLinkClick}>
              <Briefcase className="w-4 h-4" />
              Recruitment
            </NavLink>
            <NavLink to="/manager/approve-leaves" className={navLinkStyle} onClick={handleLinkClick}>
              <CalendarDays className="w-4 h-4" />
              Approve Leaves
            </NavLink>
            <NavLink to="/manager/tasks" className={navLinkStyle} onClick={handleLinkClick}>
              <CheckSquare className="w-4 h-4" />
              Tasks
            </NavLink>
            <NavLink to="/manager/timesheets" className={navLinkStyle} onClick={handleLinkClick}>
              <CalendarRange className="w-4 h-4" />
              Timesheets
            </NavLink>
            <NavLink to="/manager/appraisals" className={navLinkStyle} onClick={handleLinkClick}>
              <Award className="w-4 h-4" />
              Appraisals
            </NavLink>
            <NavLink to="/manager/service-book" className={navLinkStyle} onClick={handleLinkClick}>
              <BookOpen className="w-4 h-4" />
              Service Books
            </NavLink>
          </nav>
        </div>

        {/* Profile & Logout card */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-150 shadow-sm mb-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-inner">
              {(user.name || "M").substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-gray-900 text-xs truncate leading-tight">{user.name || "Portal Manager"}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate mt-0.5">{user.role || "Manager"}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 text-rose-700 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Access
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
