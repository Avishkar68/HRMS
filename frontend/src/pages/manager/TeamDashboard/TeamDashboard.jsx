const TeamDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">
        Team Dashboard
      </h1>

      <p className="text-gray-600 mb-6">
        Welcome, Manager
      </p>

      {/* Placeholder cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Team Members</h3>
          <p className="text-2xl mt-2">--</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Present Today</h3>
          <p className="text-2xl mt-2">--</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Pending Leaves</h3>
          <p className="text-2xl mt-2">--</p>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
