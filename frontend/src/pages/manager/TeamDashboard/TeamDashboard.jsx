import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Check, 
  X, 
  Search, 
  AlertCircle,
  Sparkles,
  Plane,
  ChevronRight
} from "lucide-react";

const TeamDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, attendanceRes, leavesRes] = await Promise.all([
        api.get("/manager/dashboard/stats"),
        api.get("/manager/team-attendance/today"),
        api.get("/manager/leaves")
      ]);
      setStats(statsRes.data);
      setTodayAttendance(attendanceRes.data || []);
      
      // Filter out only pending leaves for quick action
      const pending = (leavesRes.data || []).filter(l => l.status === "pending");
      setPendingLeaves(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatusUpdate = async (id, status) => {
    setApprovingId(id);
    try {
      await api.patch(`/manager/leaves/${id}`, { status });
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update leave");
    } finally {
      setApprovingId(null);
    }
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const attendanceRate = stats?.teamCount > 0 
    ? Math.round((stats.presentToday / stats.teamCount) * 100) 
    : 0;

  // Filter attendance list
  const filteredAttendance = todayAttendance.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const badgeColor = (status) => {
    if (status === "present") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "late") return "bg-amber-50 text-amber-700 border-amber-100";
    if (status === "on_leave") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Manager Control Center
            </div>
            <h1 className="text-3xl font-black tracking-tight">{getGreeting()}, Portal Manager</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Keep track of team attendance rate, approve pending leave applications, and streamline team productivity.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md self-start md:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Today's Attendance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-400 font-mono">{attendanceRate}%</span>
              <span className="text-xs text-slate-300">presence rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Team Members */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Managed Staff</span>
            <h3 className="text-3xl font-black text-gray-900 font-mono">{stats?.teamCount ?? 0}</h3>
            <p className="text-xs text-gray-500 font-medium">Registered employees reporting to you</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Present Today */}
        <Link 
          to="/manager/team-attendance"
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Checked-In Today</span>
            <h3 className="text-3xl font-black text-gray-950 font-mono">
              {stats?.presentToday ?? 0}<span className="text-gray-300 text-lg font-light"> / {stats?.teamCount ?? 0}</span>
            </h3>
            <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1 group-hover:underline">
              View live ledger <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </Link>

        {/* Card 3: Pending Leaves */}
        <Link 
          to="/manager/approve-leaves"
          className={`rounded-2xl border p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group ${
            (stats?.pendingLeaves ?? 0) > 0 
              ? "bg-amber-50/50 border-amber-200 text-amber-950" 
              : "bg-white border-gray-200"
          }`}
        >
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Leave Actions Pending</span>
            <h3 className={`text-3xl font-black font-mono ${
              (stats?.pendingLeaves ?? 0) > 0 ? "text-amber-700" : "text-gray-900"
            }`}>
              {stats?.pendingLeaves ?? 0}
            </h3>
            <p className={`text-xs font-semibold flex items-center gap-1 ${
              (stats?.pendingLeaves ?? 0) > 0 ? "text-amber-700 group-hover:underline" : "text-indigo-600 group-hover:underline"
            }`}>
              Resolve requests <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${
            (stats?.pendingLeaves ?? 0) > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-gray-100 text-gray-500"
          }`}>
            <Calendar className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Two-Column Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Approvals Checklist (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="font-bold text-gray-950 text-base">Quick Leave Approvals</h2>
              <p className="text-xs text-gray-400 mt-0.5">Approve or reject team requests directly</p>
            </div>
            <Link to="/manager/approve-leaves" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 flex-1">
            {pendingLeaves.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 gap-2">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-semibold text-gray-800 text-sm">Inbox Fully Cleared</p>
                <p className="text-xs text-gray-400">All team leave requests have been resolved.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {pendingLeaves.map((l) => (
                  <div key={l._id} className="border border-gray-200 rounded-2xl p-4 hover:border-indigo-100 hover:bg-indigo-50/5 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-sm shadow-inner">
                          {getInitials(l.employee?.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{l.employee?.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase">{l.leaveType?.name || "Leave Request"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-xl">
                        {l.totalDays} Day{l.totalDays > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 text-xs space-y-1.5 border border-gray-100/50">
                      <div className="flex gap-2">
                        <span className="text-gray-400 font-medium w-12">Duration:</span>
                        <span className="font-bold text-gray-800 font-mono">{l.fromDate} → {l.toDate}</span>
                      </div>
                      {l.reason && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 font-medium w-12">Reason:</span>
                          <span className="text-gray-600 italic font-medium">&quot;{l.reason}&quot;</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleQuickStatusUpdate(l._id, "approved")}
                        disabled={approvingId !== null}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold shadow-md shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleQuickStatusUpdate(l._id, "rejected")}
                        disabled={approvingId !== null}
                        className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-2 text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Team Live Roster (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 space-y-3 bg-gray-50/50">
            <div>
              <h2 className="font-bold text-gray-950 text-base">Live Attendance Roster</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real-time status of employees reporting to you</p>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-6 flex-1">
            {filteredAttendance.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 gap-2">
                <AlertCircle className="w-6 h-6 text-gray-300" />
                <p className="font-semibold text-gray-800 text-sm">No employees match</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredAttendance.map((e) => (
                  <div key={e.userId} className="flex items-center justify-between border-b border-gray-55 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-100 text-gray-600 font-bold rounded-lg flex items-center justify-center text-xs">
                        {getInitials(e.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{e.name}</p>
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-300" />
                          {e.checkInTime ? `${e.checkInTime} In` : "No activity"}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeColor(e.status)}`}>
                      {e.status === "on_leave" ? "On Leave" : e.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default TeamDashboard;
