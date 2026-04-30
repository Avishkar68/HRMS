import React, { useState } from "react";
import api from "../../../utils/api";

const CreateCompany = () => {
  const [form, setForm] = useState({
    companyName: "",
    domain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/superadmin/company", form);
      alert("Company Created Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating company");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Company</h1>
        <p className="text-gray-500 text-sm mt-1">Register a new company and its admin</p>
      </div>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-lg">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Company details</h2>

      {["companyName", "domain", "adminName", "adminEmail", "adminPassword"].map(
        (field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            className="w-full border p-2 mb-3"
            onChange={handleChange}
          />
        )
      )}

      <button
        onClick={handleSubmit}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
      >
        Create Company
      </button>
    </div>
    </div>
  );
};

export default CreateCompany;
