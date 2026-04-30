import { NavLink } from "react-router-dom";

const navClass = "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors";
const activeClass = "bg-indigo-50 text-indigo-700";
const inactiveClass = "text-gray-700 hover:bg-gray-100";

const SideBar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-lg">Super Admin</h2>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        <NavLink to="/superadmin/companies" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Companies</NavLink>
        <NavLink to="/superadmin/create-company" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Create Company</NavLink>
        <NavLink to="/superadmin/subscription-status" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Subscriptions</NavLink>
        <NavLink to="/superadmin/usage-status" className={({ isActive }) => `${navClass} ${isActive ? activeClass : inactiveClass}`}>Usage Status</NavLink>
      </nav>
    </aside>
  );
};

export default SideBar;
