import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">Sign In</h2>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="you@company.com"
          className="w-full border border-gray-300 rounded-lg p-2.5 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full border border-gray-300 rounded-lg p-2.5 mb-5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default Signin;
