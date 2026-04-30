import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/superadmin/companies");
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm mt-1">All registered companies</p>
        </div>
        <Link
          to="/superadmin/create-company"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create Company
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {companies.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No companies yet. Create one to get started.</div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Domain</th>
              <th className="border p-2 text-left">Plan</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id}>
                <td className="border p-2">{c.name}</td>
                <td className="border p-2">{c.domain || "--"}</td>
                <td className="border p-2">{c.plan || "basic"}</td>
                <td className="border p-2">{c.status || "active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default Companies;
