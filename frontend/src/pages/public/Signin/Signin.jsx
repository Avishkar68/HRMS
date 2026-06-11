import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../utils/api";
import { AlertTriangle } from "lucide-react";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorQuery = searchParams.get("error");
  const [errorState, setErrorState] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorState("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = (user.role || "").toString().toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
      else if (role === "employee") navigate("/employee");

    } catch (err) {
      setErrorState(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-150 w-full max-w-md"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-905 tracking-tight">Corporate Sign In</h2>
          <p className="text-gray-400 text-xs mt-1">Access your enterprise HRMS portal workspace</p>
        </div>

        {/* Error Banner */}
        {(errorQuery || errorState) && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-3 items-start animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase tracking-wider text-[10px]">Access Blocked</p>
              <p className="mt-0.5 leading-relaxed font-semibold">{errorQuery || errorState}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-405 mb-1">Corporate Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full border border-gray-250 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-405 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-250 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-md shadow-indigo-650/10 cursor-pointer mt-2"
          >
            Login to Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signin;
