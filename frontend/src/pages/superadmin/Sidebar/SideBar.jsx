import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="w-64 bg-white p-4 shadow">
      <h2 className="font-bold mb-4">Super Admin</h2>

      <nav className="flex flex-col gap-2">
        <Link to="/superadmin/companies">Companies</Link>
        <Link to="/superadmin/create-company">Create Company</Link>
        <Link to="/superadmin/subscription-status">Subscriptions</Link>
        <Link to="/superadmin/usage-status">Usage Status</Link>

      </nav>
    </div>
  );
};

export default SideBar;
