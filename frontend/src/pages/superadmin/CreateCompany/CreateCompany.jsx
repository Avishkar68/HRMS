import React, { useState } from "react";
import axios from "axios";

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
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/superadmin/company",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Company Created Successfully");
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating company");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-lg font-bold mb-4">Create Company</h2>

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
        className="bg-black text-white w-full py-2"
      >
        Create
      </button>
    </div>
  );
};

export default CreateCompany;
