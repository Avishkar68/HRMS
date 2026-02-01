import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [managers, setManagers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    managerId: ""
  });

  const token = localStorage.getItem("token");

  /* ================= FETCH MANAGERS ================= */
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/admin/managers",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setManagers(res.data);
      } catch (err) {
        console.error("Failed to load managers");
      }
    };

    if (open) fetchManagers();
  }, [open]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= CREATE USER ================= */
  const handleCreate = async () => {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };

      // attach managerId only for employees
      if (form.role === "employee") {
        payload.managerId = form.managerId;
      }

      await axios.post(
        "http://localhost:3000/api/admin/users",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("User created successfully");
      setOpen(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "employee",
        managerId: ""
      });

    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2"
      >
        Create User
      </button>

      {/* ===== MODAL ===== */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-4">Create User</h2>

            <input
              name="name"
              placeholder="Name"
              className="w-full border p-2 mb-2"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              className="w-full border p-2 mb-2"
              value={form.email}
              onChange={handleChange}
            />

            <input
              name="password"
              placeholder="Password"
              type="password"
              className="w-full border p-2 mb-2"
              value={form.password}
              onChange={handleChange}
            />

            <select
              name="role"
              className="w-full border p-2 mb-2"
              value={form.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>

            {/* ===== MANAGER SELECT (ONLY FOR EMPLOYEE) ===== */}
            {form.role === "employee" && (
              <select
                name="managerId"
                className="w-full border p-2 mb-4"
                value={form.managerId}
                onChange={handleChange}
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)}>Cancel</button>
              <button
                onClick={handleCreate}
                className="bg-black text-white px-4 py-1"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
