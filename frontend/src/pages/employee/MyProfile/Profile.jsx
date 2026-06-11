import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  Building, 
  UserCheck, 
  Copy, 
  Check, 
  KeyRound, 
  Activity,
  Briefcase,
  CalendarDays,
  Contact,
  Printer,
  AlertCircle,
  Landmark
} from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, security
  
  // Copy to clipboard state
  const [copied, setCopied] = useState(false);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bank Details States
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    branchName: ""
  });
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankError, setBankError] = useState("");
  const [bankSuccess, setBankSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
        if (res.data && res.data.bankDetails) {
          setBankForm({
            bankName: res.data.bankDetails.bankName || "",
            accountNumber: res.data.bankDetails.accountNumber || "",
            ifscCode: res.data.bankDetails.ifscCode || "",
            accountHolderName: res.data.bankDetails.accountHolderName || "",
            branchName: res.data.bankDetails.branchName || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });
      setPasswordSuccess(res.data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password. Verify current password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setBankError("");
    setBankSuccess("");

    if (!bankForm.accountHolderName || !bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
      setBankError("Required banking fields are missing");
      return;
    }

    setBankSubmitting(true);
    try {
      const res = await api.put("/auth/profile", {
        bankDetails: bankForm
      });
      setBankSuccess("Banking details updated successfully");
      setProfile(res.data);
    } catch (err) {
      setBankError(err.response?.data?.message || "Failed to update banking details. Verify inputs.");
    } finally {
      setBankSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
        Could not load profile. Please sign in again.
      </div>
    );
  }

  // Get Initials for Avatar
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your corporate account information and security credentials</p>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner with gradient */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Avatar and Basic Info */}
        <div className="p-6 relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 -mt-16">
          <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-600/30 border-4 border-white select-none">
            {getInitials(profile.name)}
          </div>
          
          <div className="mt-14 sm:mt-16 flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold self-center sm:self-auto ${
                profile.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                {profile.status || "active"}
              </span>
            </div>
            
            <p className="text-sm font-semibold text-indigo-600 capitalize">{profile.role} Directory</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("overview");
            setPasswordError("");
            setPasswordSuccess("");
          }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="w-4 h-4" />
          Personal Overview
        </button>
        <button
          onClick={() => {
            setActiveTab("banking");
            setPasswordError("");
            setPasswordSuccess("");
            setBankError("");
            setBankSuccess("");
            if (profile && profile.bankDetails) {
              setBankForm({
                bankName: profile.bankDetails.bankName || "",
                accountNumber: profile.bankDetails.accountNumber || "",
                ifscCode: profile.bankDetails.ifscCode || "",
                accountHolderName: profile.bankDetails.accountHolderName || "",
                branchName: profile.bankDetails.branchName || ""
              });
            }
          }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "banking"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Landmark className="w-4 h-4" />
          Banking Details
        </button>
        <button
          onClick={() => {
            setActiveTab("security");
            setPasswordError("");
            setPasswordSuccess("");
          }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "security"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Lock className="w-4 h-4" />
          Account Security
        </button>
        <button
          onClick={() => {
            setActiveTab("badge");
            setPasswordError("");
            setPasswordSuccess("");
          }}
          className={`pb-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "badge"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Contact className="w-4 h-4" />
          Digital ID Badge
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              
              {/* Account Details Group */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-extrabold text-base border-b border-gray-100 pb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  Account details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <div className="flex items-center gap-2 group">
                      <p className="text-sm font-semibold text-gray-900">{profile.email}</p>
                      <button
                        onClick={() => handleCopy(profile.email)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Copy Email"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee ID / System ID</p>
                    <p className="text-sm font-mono text-gray-600">{profile._id}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Registration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization details Group */}
              <div className="space-y-4 pt-4">
                <h3 className="text-gray-800 font-extrabold text-base border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  Corporate Organization
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Role</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{profile.role}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direct Reporting Manager</p>
                    {profile.managerId ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{profile.managerId.name || "—"}</span>
                        <span className="text-xs text-gray-500">{profile.managerId.email}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-400 italic">No manager assigned</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Corporate Department</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {profile.departmentId?.name || "General Operations"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Office Location</p>
                    <p className="text-sm font-semibold text-gray-900">Main Headquarters</p>
                  </div>
                </div>
              </div>

              {/* Banking details summary */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-gray-800 font-extrabold text-base flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-gray-400" />
                  Payroll Bank Account
                </h3>
                
                {profile.bankDetails?.accountNumber ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Name</p>
                      <p className="text-sm font-semibold text-gray-900">{profile.bankDetails.bankName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Number</p>
                      <p className="text-sm font-mono text-gray-900">
                        {`•••• •••• •••• ${profile.bankDetails.accountNumber.slice(-4)}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="text-left">
                      <h4 className="text-xs font-black text-amber-850 uppercase tracking-wider">Missing Bank Details</h4>
                      <p className="text-[10px] text-amber-750 font-semibold mt-0.5">Please navigate to the "Banking Details" tab to register your bank account details. This is required for HR to calculate and disburse your payroll.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === "banking" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-gray-800 font-extrabold text-base flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-gray-400" />
                  Configure Bank Account Details
                </h3>
                <p className="text-xs text-gray-400 mt-1">Provide your banking particulars to enable payroll direct deposit processing</p>
              </div>

              {bankError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{bankError}</span>
                </div>
              )}

              {bankSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-bounce-short">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{bankSuccess}</span>
                </div>
              )}

              <form onSubmit={handleBankSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-gray-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Silicon Valley Branch"
                      value={bankForm.branchName}
                      onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50100412345678"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono font-medium text-gray-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">IFSC / BIC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={bankForm.ifscCode}
                      onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono font-medium text-gray-900"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bankSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {bankSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {bankSubmitting ? "Updating..." : "Save Banking Details"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-gray-800 font-extrabold text-base flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-gray-400" />
                  Change Password
                </h3>
                <p className="text-xs text-gray-400 mt-1">Set a new secure password for your HRMS account access</p>
              </div>

              {passwordError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-bounce-short">
                  <Check className="w-4 h-4" />
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  {submitting ? "Updating..." : "Save Password"}
                </button>
              </form>

            </div>
          )}

          {activeTab === "badge" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center space-y-6">
              <div className="flex items-center justify-between w-full border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-gray-800 text-base">Digital ID Badge</h3>
                  <p className="text-xs text-gray-400">Your digital corporate identity access card</p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Badge
                </button>
              </div>

              <div id="employee-id-badge" className="w-72 h-[420px] bg-slate-950 text-white rounded-3xl p-5 shadow-2xl relative border-4 border-indigo-500 overflow-hidden flex flex-col justify-between items-center bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 print:border-indigo-650">
                {/* Decorative Holographic Chip */}
                <div className="absolute top-24 right-6 w-10 h-8 bg-amber-400/20 border border-amber-400/40 rounded-lg flex flex-col justify-between p-1 opacity-60">
                  <div className="w-full h-[1px] bg-amber-400/40" />
                  <div className="w-full h-[1px] bg-amber-400/40" />
                  <div className="w-full h-[1px] bg-amber-400/40" />
                </div>

                {/* Corporate Header */}
                <div className="flex flex-col items-center space-y-1 w-full text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">HRMS CORPORATE</span>
                  </div>
                  <div className="w-12 h-[2px] bg-indigo-500 rounded-full mx-auto" />
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-3 mt-2">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-655/30 border-2 border-indigo-400 relative select-none">
                    {getInitials(profile.name)}
                    <div className="absolute -bottom-1.5 px-2 py-0.5 bg-emerald-500 text-white font-extrabold text-[8px] uppercase tracking-wider rounded-full border border-slate-950 shadow">
                      ACTIVE
                    </div>
                  </div>

                  <div className="text-center space-y-0.5">
                    <h4 className="font-extrabold text-sm text-slate-100 tracking-tight leading-none mt-1">{profile.name}</h4>
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">{profile.role}</p>
                  </div>
                </div>

                {/* Corporate Metadata Block */}
                <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 text-center space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 font-bold uppercase">ID Number</span>
                    <span className="font-mono text-gray-200 font-semibold">{profile._id.substring(0, 10).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 font-bold uppercase">Department</span>
                    <span className="text-gray-200 font-semibold">
                      {profile.departmentId?.name || "General Operations"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 font-bold uppercase">Issued Date</span>
                    <span className="text-indigo-200 font-semibold">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Barcode */}
                <div className="w-full flex flex-col items-center mt-1 space-y-1">
                  <div className="h-6 w-44 bg-white p-1 rounded-sm flex items-center justify-around opacity-90">
                    <div className="w-[2px] h-4 bg-black" />
                    <div className="w-[1px] h-4 bg-black" />
                    <div className="w-[3px] h-4 bg-black" />
                    <div className="w-[1px] h-4 bg-black" />
                    <div className="w-[2px] h-4 bg-black" />
                    <div className="w-[1px] h-4 bg-black" />
                    <div className="w-[3px] h-4 bg-black" />
                    <div className="w-[2px] h-4 bg-black" />
                    <div className="w-[1px] h-4 bg-black" />
                    <div className="w-[2px] h-4 bg-black" />
                    <div className="w-[4px] h-4 bg-black" />
                    <div className="w-[1px] h-4 bg-black" />
                  </div>
                  <span className="text-[7px] text-gray-500 font-black tracking-widest font-mono uppercase">Secure Corporate ID Access</span>
                </div>
              </div>
              
              {/* Local style tag to isolate print functionality */}
              <style dangerouslySetInnerHTML={{__html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #employee-id-badge, #employee-id-badge * {
                    visibility: visible !important;
                  }
                  #employee-id-badge {
                    position: absolute !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) scale(1.5) !important;
                    border-color: #4f46e5 !important;
                    box-shadow: none !important;
                  }
                }
              `}} />
            </div>
          )}

        </div>

        {/* Side Cards (Security & Status overview) */}
        <div className="space-y-6">
          
          {/* Quick status card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              Employment Status
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-400 uppercase tracking-wider">System Status</span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase">
                  Online / Active
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-400 uppercase tracking-wider">Role Access</span>
                <span className="font-bold text-gray-700 uppercase">
                  {profile.role}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-400 uppercase tracking-wider">Access Clearance</span>
                <span className="font-bold text-indigo-600 uppercase">
                  Tier {profile.role === "admin" ? "3" : profile.role === "manager" ? "2" : "1"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick instructions/help */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              Security Check
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              To keep your corporate profile secure, please update your password regularly and avoid sharing login credentials.
            </p>
            
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              Last accessed IP geolocation check will be logged during attendance punches.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
