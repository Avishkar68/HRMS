import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  X, 
  Search, 
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  Smile,
  AlertTriangle
} from "lucide-react";

const TeamAttendance = () => {
  const [todayData, setTodayData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [monthData, setMonthData] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchToday = async () => {
    try {
      const res = await api.get("/manager/team-attendance/today");
      setTodayData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchEmployeeMonth = async (userId, selectedMonth = month) => {
    try {
      const res = await api.get(`/manager/employee-attendance/${userId}?month=${selectedMonth}`);
      setMonthData(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedEmp) {
      fetchEmployeeMonth(selectedEmp.userId, month);
    }
  }, [month, selectedEmp]);

  const badgeColor = (status) => {
    if (status === "present") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "late") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "on_leave") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Stats calculation
  const totalEmployees = todayData.length;
  const presentCount = todayData.filter(e => e.status === "present").length;
  const lateCount = todayData.filter(e => e.status === "late").length;
  const leaveCount = todayData.filter(e => e.status === "on_leave").length;
  const absentCount = todayData.filter(e => e.status === "absent").length;

  const filteredTeam = todayData.filter(e => {
    const matchesSearch = e.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate monthly stats for modal
  const getMonthlyStats = () => {
    if (monthData.length === 0) return { present: 0, late: 0, leave: 0, absent: 0 };
    return {
      present: monthData.filter(d => d.status === "present").length,
      late: monthData.filter(d => d.status === "late").length,
      leave: monthData.filter(d => d.status === "on_leave").length,
      absent: monthData.filter(d => d.status === "absent").length
    };
  };

  const modalStats = getMonthlyStats();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time status roster and employee history explorer</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Team</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-black text-gray-900 font-mono">{totalEmployees}</span>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Present Today</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{presentCount}</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Late Check-Ins</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-black text-amber-600 font-mono">{lateCount}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">On Approved Leave</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-black text-blue-600 font-mono">{leaveCount}</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unexcused Absent</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-black text-rose-600 font-mono">{absentCount}</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Main Roster Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filter Controls */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-400 font-bold uppercase mr-1 whitespace-nowrap">Filter Status:</span>
            {[
              { id: "all", label: "All Statuses" },
              { id: "present", label: "Present" },
              { id: "late", label: "Late" },
              { id: "on_leave", label: "On Leave" },
              { id: "absent", label: "Absent" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  statusFilter === f.id 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roster Table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto" />
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-300" />
            <p className="font-semibold text-gray-800 text-sm">No employees found matching filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Employee</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Status</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Check-In Time</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Check-Out Time</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeam.map((e) => (
                  <tr key={e.userId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-sm shadow-inner">
                        {getInitials(e.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-950">{e.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{e.userId}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${badgeColor(e.status)}`}>
                        {e.status === "on_leave" ? "On Leave" : e.status}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600 font-mono font-medium">{e.checkInTime || "—"}</td>
                    <td className="p-4 text-center text-gray-600 font-mono font-medium">{e.checkOutTime || "—"}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => { setSelectedEmp(e); fetchEmployeeMonth(e.userId); }} 
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] border border-indigo-100"
                      >
                        Monthly Log <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Monthly Attendance Details Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-sm shadow-inner">
                  {getInitials(selectedEmp.name)}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base">{selectedEmp.name}</h3>
                  <p className="text-xs text-gray-400">Detailed calendar history log</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmp(null)} 
                className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Month selector & stats */}
            <div className="p-6 border-b border-gray-100 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Select Month</label>
                  <input 
                    type="month" 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)} 
                    className="border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
                  />
                </div>
                
                {/* Stats Summary for employee */}
                <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 text-center min-w-[70px]">
                    <span className="text-[9px] uppercase font-bold text-emerald-700 block">Present</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">{modalStats.present}</span>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2 text-center min-w-[70px]">
                    <span className="text-[9px] uppercase font-bold text-amber-700 block">Late</span>
                    <span className="text-sm font-black text-amber-700 font-mono">{modalStats.late}</span>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2 text-center min-w-[70px]">
                    <span className="text-[9px] uppercase font-bold text-blue-700 block">Leave</span>
                    <span className="text-sm font-black text-blue-700 font-mono">{modalStats.leave}</span>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2 text-center min-w-[70px]">
                    <span className="text-[9px] uppercase font-bold text-rose-700 block">Absent</span>
                    <span className="text-sm font-black text-rose-700 font-mono">{modalStats.absent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Calendar Roster */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthData.map((d) => (
                  <div 
                    key={d.date} 
                    className="bg-white rounded-xl border border-gray-150 p-3.5 flex items-center justify-between shadow-sm hover:border-indigo-100 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-900 text-xs font-mono">{d.date}</p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Daily record log</span>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeColor(d.status)}`}>
                      {d.status === "on_leave" ? "On Leave" : d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedEmp(null)} 
                className="px-4 py-2 bg-gray-950 text-white rounded-xl text-xs font-bold hover:bg-gray-900 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-gray-950/15"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAttendance;
