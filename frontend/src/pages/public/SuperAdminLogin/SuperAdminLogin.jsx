import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../utils/api";
import { Mail, Lock, Shield, ChevronRight, Star } from "lucide-react";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/superadmin/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/superadmin");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans">
      
      {/* LEFT COLUMN: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-[#f8fafd] relative z-10">
        
        {/* Header Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-[#303f9f] flex items-center">
              the <span className="text-[#3b82f6] font-extrabold ml-1">workspace</span>
              <span className="text-xs text-[#64748b] align-super font-medium ml-0.5">.app</span>
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-12">
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#303f9f]/5 text-[#303f9f] mb-6">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] leading-tight tracking-tight">
            Super Admin Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-light">
            Sign in to manage global tenants, companies, and usage tiers.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#64748b] mb-2">
                Super Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="superadmin@workspace.app"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#303f9f] focus:ring-1 focus:ring-[#303f9f] transition-all text-sm font-light"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#64748b] mb-2">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#303f9f] focus:ring-1 focus:ring-[#303f9f] transition-all text-sm font-light"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#303f9f] hover:bg-[#283593] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:translate-y-0 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center space-x-2 mt-6 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Verifying..." : "Authorized Login"}</span>
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>

          </form>

          {/* Normal Login Link */}
          <div className="mt-8 text-center text-xs text-[#64748b] font-light">
            Not a Super Admin?{" "}
            <Link to="/signin" className="text-[#3b82f6] font-semibold hover:underline">
              Go to Employee Sign In
            </Link>
          </div>

        </div>

        {/* Footer Credit */}
        <div className="text-left text-[10px] text-[#94a3b8] font-light">
          <p>© {new Date().getFullYear()} Workspace Global Administration Hub. Multi-Tenant secure lock.</p>
        </div>

      </div>

      {/* RIGHT COLUMN: TEAM PHOTO BANNER */}
      <div className="hidden lg:flex w-1/2 p-6 bg-[#f1f5f9] items-center justify-center h-screen overflow-hidden">
        <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300">
          
          {/* Main Visual Image */}
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
            alt="Collaborative HR Team" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          {/* Testimonial Quote Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10 space-y-4">
            
            {/* Top Avatar Row */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3.5">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80" 
                  alt="System Architect" 
                  className="w-11 h-11 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">Alexander V.</h4>
                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Super Administrator</p>
                </div>
              </div>
              <div className="flex space-x-0.5 text-indigo-400">
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
              </div>
            </div>

            {/* Testimonial Message */}
            <div className="bg-white text-slate-700 p-5 rounded-2xl shadow-xl space-y-2 border border-slate-100/10">
              <span className="text-3xl text-indigo-500 font-serif leading-none block h-2">“</span>
              <p className="text-xs sm:text-sm font-light leading-relaxed italic text-slate-600">
                Security and scale are paramount. Our SaaS platform enforces data partitioning at the database level, ensuring isolated multi-tenancy operations for all global firms.
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default SuperAdminLogin;
