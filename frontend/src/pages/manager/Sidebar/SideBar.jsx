import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="w-64 bg-white shadow p-4">
      <h2 className="font-bold mb-4">Manager</h2>

      <nav className="flex flex-col gap-2">
        <Link to="/manager/dashboard">Team Dashboard</Link>
        <Link to="/manager/team-attendance">Team Attendance</Link>
        <Link to="/manager/approve-leaves">Approve Leaves</Link>
      </nav>
    </div>
  );
};

export default SideBar;
