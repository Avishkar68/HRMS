import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Building2, 
  User, 
  Tag, 
  Trash2, 
  Edit3, 
  Users, 
  Plus, 
  X, 
  AlertCircle
} from "lucide-react";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    headId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depRes, manRes] = await Promise.all([
        api.get("/admin/departments"),
        api.get("/admin/managers"),
      ]);
      setDepartments(depRes.data || []);
      setManagers(manRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name || !form.code) {
      alert("Name and Code are required");
      return;
    }
    try {
      if (editMode) {
        await api.patch(`/admin/departments/${editingId}`, form);
        alert("Department updated");
      } else {
        await api.post("/admin/departments", form);
        alert("Department created");
      }
      resetModal();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving department");
    }
  };

  const handleEdit = (dept) => {
    setEditMode(true);
    setEditingId(dept._id);
    setForm({
      name: dept.name,
      code: dept.code || "",
      headId: dept.headId?._id || dept.headId || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      alert("Department deleted");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting department");
    }
  };

  const resetModal = () => {
    setForm({ name: "", code: "", headId: "" });
    setEditMode(false);
    setEditingId(null);
    setOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const totalDepts = departments.length;
  const staffedDepts = departments.filter((d) => d.headId).length;
  const vacantDepts = totalDepts - staffedDepts;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Configure structural units, cost centers, and assign department managers</p>
        </div>
        <button
          onClick={() => {
            setEditMode(false);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Departments</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalDepts}</span>
        </div>
        <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">With Assignee Head</span>
          <span className="text-2xl font-black text-emerald-700 mt-2 font-mono">{staffedDepts}</span>
        </div>
        <div className="bg-amber-50/20 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Vacant Heads</span>
          <span className="text-2xl font-black text-amber-700 mt-2 font-mono">{vacantDepts}</span>
        </div>
      </div>

      {/* Grid of Department Cards */}
      {departments.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8 text-gray-300" />
          <p className="font-semibold text-gray-800 text-sm">No departments created yet</p>
          <p className="text-xs text-gray-450">Click &quot;Add Department&quot; above to create a team group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const headName = dept.headId?.name || "Unassigned Head";
            return (
              <div 
                key={dept._id}
                className="bg-white rounded-3xl border border-gray-205 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-xl text-[10px] font-black tracking-widest font-mono uppercase">
                        {dept.code || "N/A"}
                      </span>
                      <h3 className="text-base font-extrabold text-gray-955 pt-1.5">{dept.name}</h3>
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-500">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-150 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center uppercase shadow-inner ${
                      dept.headId ? "bg-indigo-950 text-indigo-200" : "bg-gray-200 text-gray-400"
                    }`}>
                      {getInitials(headName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate leading-tight">{headName}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{dept.headId ? "Department Head" : "Vacant Position"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-gray-450 font-mono">ID: {dept._id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 hover:bg-gray-200/60 rounded-xl text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 hover:text-rose-905 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden flex flex-col animate-fade-in">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-955">{editMode ? "Modify Department" : "Add Department"}</h2>
                <p className="text-gray-500 text-xs mt-0.5">Manage organizational units and direct team leaders</p>
              </div>
              <button 
                onClick={resetModal} 
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Department Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium" 
                    placeholder="e.g. Technology & Engineering" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Department Code</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    name="code" 
                    value={form.code} 
                    onChange={handleChange} 
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white uppercase font-mono font-medium" 
                    placeholder="e.g. TECH" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Department Head (Manager)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select 
                    name="headId" 
                    value={form.headId} 
                    onChange={handleChange} 
                    className="w-full border border-gray-255 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none outline-none font-medium text-gray-900"
                  >
                    <option value="">Select Department Head (Optional)</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                type="button" 
                onClick={resetModal} 
                className="flex-1 border border-gray-250 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCreateOrUpdate} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                {editMode ? "Save Changes" : "Create Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
