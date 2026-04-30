import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";

const TeamDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/manager/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: "Team Members", value: stats?.teamCount ?? 0, color: "indigo", link: null },
    { label: "Present Today", value: stats?.presentToday ?? 0, color: "emerald", link: "/manager/team-attendance" },
    { label: "Pending Leaves", value: stats?.pendingLeaves ?? 0, color: "amber", link: "/manager/approve-leaves" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your team</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {c.link ? (
              <Link to={c.link} className="block p-6 hover:bg-gray-50/50 transition-colors">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
                <p className="text-xs text-indigo-600 mt-2 font-medium">View →</p>
              </Link>
            ) : (
              <div className="p-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Quick actions</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage team attendance and leaves</p>
        </div>
        <div className="p-4 flex flex-wrap gap-3">
          <Link to="/manager/team-attendance" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700">
            Team Attendance
          </Link>
          <Link to="/manager/approve-leaves" className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50">
            Approve Leaves
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
