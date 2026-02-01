import React, { useEffect, useState } from "react";
import axios from "axios";

const Attendance = () => {
  const [data, setData] = useState([]);
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:3000/api/admin/attendance/grouped${
        date ? `?date=${date}` : ""
      }`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Attendance (Grouped by Manager)</h2>

      <input
        type="date"
        className="border p-2 mb-4"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onBlur={fetchData}
      />

      {data.map(manager => (
        <div key={manager.managerId} className="mb-6 border rounded">
          <div className="bg-gray-100 px-4 py-2 font-semibold">
            Manager: {manager.managerName}
          </div>

          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2">Employee</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Check In</th>
                <th className="border p-2">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {manager.team.map(emp => (
                <tr key={emp.userId} className="text-center">
                  <td className="border p-2">{emp.name}</td>
                  <td className="border p-2">{emp.status}</td>
                  <td className="border p-2">{emp.checkInTime || "--"}</td>
                  <td className="border p-2">{emp.checkOutTime || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Attendance;
