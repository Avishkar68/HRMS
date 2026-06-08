import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Sliders, 
  Plus, 
  Tag, 
  Calendar, 
  CalendarClock, 
  AlertCircle,
  Hash,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";

const Settings = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    yearlyQuota: ""
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/leave-types");
      setTypes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.name || !form.yearlyQuota) {
      alert("Please enter a name and yearly quota quota value.");
      return;
    }
    try {
      await api.post("/admin/leave-types", form);
      alert("Leave type created successfully");
      setForm({ name: "", yearlyQuota: "" });
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating leave type");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">System Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure workspace parameters, leave categories, and annual quotas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD LEAVE TYPE FORM */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-5 self-start">
          <div>
            <h2 className="text-base font-extrabold text-gray-950">Add Leave Type</h2>
            <p className="text-gray-400 text-xs mt-0.5">Provision a new leave category</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Leave Category Name</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="name"
                  placeholder="e.g. Casual Leave"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Annual Quota (Days)</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-gray-455 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="yearlyQuota"
                  type="number"
                  placeholder="e.g. 12"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={form.yearlyQuota}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* LIST EXISTING LEAVE TYPES */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 lg:col-span-2 space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-gray-955">Configured Leave Types</h2>
            <p className="text-gray-400 text-xs mt-0.5">Company-wide configured leave quotas</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto" />
            </div>
          ) : types.length === 0 ? (
            <div className="p-16 text-center text-gray-400 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-300" />
              <p className="font-semibold text-gray-800 text-sm">No leave types configured</p>
              <p className="text-xs">Configure your first leave category using the panel on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {types.map((t) => (
                <div 
                  key={t._id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <CalendarClock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-950 text-sm">{t.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {t._id}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-750 font-mono leading-none">{t.yearlyQuota}</p>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Days / Year</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Settings;
