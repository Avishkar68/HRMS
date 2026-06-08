import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { 
  Building2, 
  Globe, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Server
} from "lucide-react";

const CreateCompany = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    domain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.domain || !form.adminName || !form.adminEmail || !form.adminPassword) {
      alert("Please enter all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/superadmin/company", form);
      alert("Company Created Successfully");
      navigate("/superadmin/companies");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating company");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/superadmin/companies")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Companies</span>
          </button>
          <h1 className="text-3xl font-extrabold text-gray-955 tracking-tight">Provision Enterprise</h1>
          <p className="text-gray-500 text-sm mt-1">Register a new corporation and provision its root administrator account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Company Profile details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-indigo-650">
              <Building2 className="w-5 h-5" />
              <h2 className="text-base font-extrabold text-gray-955">Company Profile</h2>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">Basic identity information for the company</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Company Registered Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="companyName"
                  placeholder="e.g. Acme Corporation"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Corporate Domain Address</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="domain"
                  placeholder="e.g. acme.com"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
                  value={form.domain}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex gap-3 text-xs text-gray-500 items-start">
            <Server className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="leading-normal">Provisioning this company initializes separate analytics reports, document indexes, departments log registers, and payroll templates.</p>
          </div>
        </div>

        {/* Section 2: Root Admin account details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-indigo-650">
              <User className="w-5 h-5" />
              <h2 className="text-base font-extrabold text-gray-955">Root Administrator</h2>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">Initial administrator credentials for the portal</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Administrator Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="adminName"
                  placeholder="e.g. Jane Doe"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={form.adminName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="adminEmail"
                  type="email"
                  placeholder="e.g. admin@acme.com"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={form.adminEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-405 font-bold uppercase tracking-wider mb-1">Initial Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-250 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={form.adminPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Initialize Company Setup</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateCompany;
