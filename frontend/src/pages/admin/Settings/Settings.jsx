import React, { useEffect, useState } from "react";
import axios from "axios";

const Settings = () => {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    yearlyQuota: ""
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTypes = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/admin/leave-types",
      { headers }
    );
    setTypes(res.data);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/admin/leave-types",
        form,
        { headers }
      );

      alert("Leave type created");
      setForm({ name: "", yearlyQuota: "" });
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-xl font-bold">Leave Settings</h1>

      {/* ===== CREATE LEAVE TYPE ===== */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Add Leave Type</h2>

        <input
          name="name"
          placeholder="Leave Name (e.g. Casual)"
          className="w-full border p-2 mb-2"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="yearlyQuota"
          type="number"
          placeholder="Yearly Quota (days)"
          className="w-full border p-2 mb-4"
          value={form.yearlyQuota}
          onChange={handleChange}
        />

        <button
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2"
        >
          Add Leave Type
        </button>
      </div>

      {/* ===== LIST LEAVE TYPES ===== */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Existing Leave Types</h2>

        {types.length === 0 ? (
          <p className="text-gray-500 text-sm">No leave types created</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Yearly Quota</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t._id} className="text-center">
                  <td className="border p-2">{t.name}</td>
                  <td className="border p-2">{t.yearlyQuota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Settings;
