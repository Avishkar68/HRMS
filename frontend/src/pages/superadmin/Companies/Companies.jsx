import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import { 
  Building2, 
  Plus, 
  Globe, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp
} from "lucide-react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/superadmin/companies");
        setCompanies(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Stats calculations
  const totalCount = companies.length;
  const premiumCount = companies.filter((c) => c.plan === "premium").length;
  const activeCount = companies.filter((c) => c.status === "active" || !c.status).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-955 tracking-tight">Registered Companies</h1>
          <p className="text-gray-500 text-sm mt-1">Directory of enterprise clients provisioned on the HRMS platform</p>
        </div>
        <Link
          to="/superadmin/create-company"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Company</span>
        </Link>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Corporations</span>
            <p className="text-3xl font-black text-gray-955 font-mono">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Premium Subscriptions</span>
            <p className="text-3xl font-black text-amber-600 font-mono">{premiumCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-655">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-205 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Instances</span>
            <p className="text-3xl font-black text-emerald-600 font-mono">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-655">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Database Listing Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {companies.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No companies registered</p>
            <p className="text-xs">Get started by provisioning the first corporate account using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Company Name</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Primary Domain</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Service Plan</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Instance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((c) => {
                  const initials = getInitials(c.name || "C");
                  const plan = c.plan || "basic";
                  const status = c.status || "active";
                  return (
                    <tr key={c._id} className="hover:bg-indigo-50/10 transition-colors">
                      <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-xs shadow-inner">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-955">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {c._id}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg border border-gray-150">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          {c.domain || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase font-mono border ${
                          plan === "premium" 
                            ? "bg-amber-50 text-amber-700 border-amber-150" 
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {plan}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${
                          status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                            : "bg-rose-50 text-rose-700 border-rose-150"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
