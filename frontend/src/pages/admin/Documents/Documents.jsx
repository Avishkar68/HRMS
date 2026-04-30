import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const DOC_TYPES = ["policy", "form", "template", "other"];

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "other", description: "", fileUrl: "" });

  const fetchDocs = async () => {
    try {
      const res = await api.get("/admin/documents");
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchDocs();
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      await api.post("/admin/documents", form);
      alert("Document added");
      setOpen(false);
      setForm({ name: "", type: "other", description: "", fileUrl: "" });
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await api.delete(`/admin/documents/${id}`);
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Policies, forms and templates</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm">
          + Add Document
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {docs.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No documents. Add policies, forms, or templates.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Uploaded By</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d._id}>
                <td className="border p-2 font-medium">{d.name}</td>
                <td className="border p-2">{d.type}</td>
                <td className="border p-2 text-gray-600 max-w-xs truncate">{d.description || "—"}</td>
                <td className="border p-2">{d.uploadedBy?.name || "—"}</td>
                <td className="border p-2">
                  {d.fileUrl && (
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs mr-2">Open</a>
                  )}
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
            <h3 className="font-bold mb-4">Add Document</h3>
            <input name="name" className="w-full border p-2 mb-2" value={form.name} onChange={handleChange} placeholder="Document name" required />
            <select name="type" className="w-full border p-2 mb-2" value={form.type} onChange={handleChange}>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <textarea name="description" className="w-full border p-2 mb-2" value={form.description} onChange={handleChange} placeholder="Description" rows={2} />
            <input name="fileUrl" className="w-full border p-2 mb-2" value={form.fileUrl} onChange={handleChange} placeholder="File URL (optional)" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleCreate} className="bg-black text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
