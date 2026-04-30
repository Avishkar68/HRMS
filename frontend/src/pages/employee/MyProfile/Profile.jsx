import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  if (!profile) return <div className="p-4 text-gray-500">Could not load profile.</div>;

  const rows = [
    { label: "Name", value: profile.name },
    { label: "Email", value: profile.email },
    { label: "Role", value: profile.role },
    { label: "Manager", value: profile.managerId ? (profile.managerId.name || profile.managerId.email) : "—" },
    { label: "Status", value: profile.status || "active" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account details</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-lg">
        <div className="p-6 space-y-4">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm font-medium text-gray-500">{r.label}</span>
              <span className="text-sm font-medium text-gray-900">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
