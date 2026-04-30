import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const Settings = () => {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    yearlyQuota: ""
  });

  const fetchTypes = async () => {
    const res = await api.get("/admin/leave-types");
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
      await api.post("/admin/leave-types", form);

      alert("Leave type created");
      setForm({ name: "", yearlyQuota: "" });
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Leave types and quotas</p>
      </div>

      {/* ===== CREATE LEAVE TYPE ===== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
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
