import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/SideBar";

const ManagerPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ManagerPage;
