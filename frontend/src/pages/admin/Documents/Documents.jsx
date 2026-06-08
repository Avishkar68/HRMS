import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  FolderOpen, 
  FileText, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag,
  Download,
  AlertCircle,
  X,
  Sparkles
} from "lucide-react";

const getCategoryColor = (cat) => {
  const c = (cat || "").toLowerCase();
  if (c === "policy") return "bg-purple-50 text-purple-700 border-purple-200";
  if (c === "form") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (c === "template") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "policy",
    url: "",
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/documents");
      setDocs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.title || !form.url) {
      alert("Title and document URL are required");
      return;
    }
    try {
      await api.post("/admin/documents", form);
      alert("Document created successfully");
      setOpen(false);
      setForm({ title: "", category: "policy", url: "" });
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating document");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      alert("Document deleted");
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting document");
    }
  };

  // Stats
  const totalDocs = docs.length;
  const policyDocs = docs.filter((d) => d.category === "policy").length;
  const formDocs = docs.filter((d) => d.category === "form").length;
  const templateDocs = docs.filter((d) => d.category === "template").length;

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
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Documents Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Publish and index enterprise templates, HR policy forms, and company guidelines</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Publish Document</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Documents</span>
          <span className="text-2xl font-black text-gray-955 mt-2 font-mono">{totalDocs}</span>
        </div>
        <div className="bg-purple-50/20 p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Policies</span>
          <span className="text-2xl font-black text-purple-700 mt-2 font-mono">{policyDocs}</span>
        </div>
        <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Forms</span>
          <span className="text-2xl font-black text-emerald-700 mt-2 font-mono">{formDocs}</span>
        </div>
        <div className="bg-blue-50/20 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Templates</span>
          <span className="text-2xl font-black text-blue-700 mt-2 font-mono">{templateDocs}</span>
        </div>
      </div>

      {/* Roster of Documents */}
      {docs.length === 0 ? (
        <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8 text-gray-300" />
          <p className="font-semibold text-gray-800 text-sm">No documents published yet</p>
          <p className="text-xs text-gray-450">Click &quot;Publish Document&quot; to index a new PDF form or document URL.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((d) => (
            <div 
              key={d._id}
              className="bg-white rounded-3xl border border-gray-205 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black tracking-widest font-mono uppercase border ${getCategoryColor(d.category)}`}>
                      {d.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-gray-950 pt-1 leading-snug line-clamp-2" title={d.title}>
                      {d.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Published {new Date(d.createdAt || Date.now()).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                </div>
              </div>

              {/* Action bar */}
              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
                <span className="text-[10px] text-gray-450 font-mono truncate max-w-[120px]">ID: {d._id}</span>
                <div className="flex items-center gap-1.5">
                  <a 
                    href={d.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-gray-750 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open Link</span>
                  </a>
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 hover:text-rose-905 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Modal Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden flex flex-col animate-fade-in">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-950">Publish Document</h2>
                <p className="text-gray-500 text-xs mt-0.5">Publish static guidelines, template documents, or forms</p>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1.5 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Document Title</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
                    placeholder="e.g. Employee Handbook 2026" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Document URL / File Resource</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    name="url" 
                    value={form.url} 
                    onChange={handleChange} 
                    className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
                    placeholder="https://example.com/handbook.pdf" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Select Category</label>
                <div className="relative">
                  <FolderOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    className="w-full border border-gray-255 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none"
                  >
                    <option value="policy">Policy / Guideline</option>
                    <option value="form">Corporate Form</option>
                    <option value="template">Document Template</option>
                    <option value="other">Other Documents</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                type="button" 
                onClick={() => setOpen(false)} 
                className="flex-1 border border-gray-250 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCreate} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-[0.98] cursor-pointer text-center"
              >
                Publish Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
