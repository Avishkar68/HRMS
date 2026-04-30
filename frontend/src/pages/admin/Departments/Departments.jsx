import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", headId: "" });

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchDepartments(), fetchUsers()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      await api.post("/admin/departments", form);
      alert("Department created");
      setOpen(false);
      setForm({ name: "", code: "", headId: "" });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await api.patch(`/admin/departments/${editing._id}`, form);
      setEditing(null);
      setForm({ name: "", code: "", headId: "" });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name, code: d.code || "", headId: d.headId?._id || "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage departments and heads</p>
        </div>
        <button onClick={() => { setOpen(true); fetchUsers(); }} className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm">
          + Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {departments.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No departments. Add one to get started.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Name</th>
              <th className="text-left p-4 font-semibold text-gray-700">Code</th>
              <th className="text-left p-4 font-semibold text-gray-700">Head</th>
              <th className="text-left p-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((d) => (
              <tr key={d._id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-900">{d.name}</td>
                <td className="p-4 text-gray-600">{d.code || "—"}</td>
                <td className="p-4 text-gray-600">{d.headId?.name || "—"}</td>
                <td className="p-4">
                  <button onClick={() => openEdit(d)} className="text-blue-600 text-xs mr-2">Edit</button>
                  <button onClick={() => handleDelete(d._id)} className="text-red-600 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="font-bold mb-4">Add Department</h3>
            <input name="name" className="w-full border p-2 mb-2" value={form.name} onChange={handleChange} placeholder="Name" required />
            <input name="code" className="w-full border p-2 mb-2" value={form.code} onChange={handleChange} placeholder="Code" />
            <select name="headId" className="w-full border p-2 mb-2" value={form.headId} onChange={handleChange}>
              <option value="">No head</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleCreate} className="bg-black text-white px-4 py-2 rounded">Create</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="font-bold mb-4">Edit Department</h3>
            <input name="name" className="w-full border p-2 mb-2" value={form.name} onChange={handleChange} placeholder="Name" required />
            <input name="code" className="w-full border p-2 mb-2" value={form.code} onChange={handleChange} placeholder="Code" />
            <select name="headId" className="w-full border p-2 mb-2" value={form.headId} onChange={handleChange}>
              <option value="">No head</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleUpdate} className="bg-black text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
