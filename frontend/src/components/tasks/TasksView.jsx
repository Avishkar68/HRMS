import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  User, 
  Calendar, 
  LayoutGrid, 
  List, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  AlertCircle,
  X,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Bell,
  Check
} from "lucide-react";

const TasksView = ({ role }) => {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("board"); // board, list

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalTask, setModalTask] = useState(null); // null = Create, taskObject = Edit
  const [modalForm, setModalForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    status: "pending"
  });
  const [errorMsg, setErrorMsg] = useState("");

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchAssignees = async () => {
    if (role === "employee") return;
    try {
      const res = await api.get("/tasks/assignees");
      setAssignees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch assignees:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/tasks/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchAssignees(), fetchNotifications()]);
      setLoading(false);
    };
    initData();
  }, [role]);

  const handleOpenCreateModal = () => {
    setErrorMsg("");
    setModalTask(null);
    setModalForm({
      title: "",
      description: "",
      assignedTo: assignees.length > 0 ? assignees[0]._id : "",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending"
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (task) => {
    setErrorMsg("");
    setModalTask(task);
    setModalForm({
      title: task.title,
      description: task.description || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      status: task.status || "pending"
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTask(null);
    setErrorMsg("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!modalForm.title.trim()) {
      setErrorMsg("Title is required");
      return;
    }
    if (!modalForm.assignedTo) {
      setErrorMsg("Assignee is required");
      return;
    }
    if (!modalForm.dueDate) {
      setErrorMsg("Due date is required");
      return;
    }

    setActionLoading(true);
    try {
      if (modalTask) {
        // Edit Task
        const res = await api.put(`/tasks/${modalTask._id}`, modalForm);
        setTasks(tasks.map(t => t._id === modalTask._id ? res.data : t));
      } else {
        // Create Task
        const res = await api.post("/tasks", modalForm);
        setTasks([res.data, ...tasks]);
      }
      handleCloseModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong. Verify inputs.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleSendReminderAlert = async (id) => {
    try {
      await api.post(`/tasks/${id}/alert`);
      alert("Reminder Alert sent successfully to the assignee!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send alert");
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await api.put(`/tasks/notifications/${notificationId}/read`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error(err);
    }
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

  const isOverdue = (dueDate, status) => {
    if (status === "completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    
    const targetAssigneeId = t.assignedTo?._id || t.assignedTo;
    const matchesAssignee = assigneeFilter === "all" || targetAssigneeId === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Calculate Metrics
  const totalCount = filteredTasks.length;
  const pendingCount = filteredTasks.filter(t => t.status === "pending").length;
  const inProgressCount = filteredTasks.filter(t => t.status === "in-progress").length;
  const completedCount = filteredTasks.filter(t => t.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const priorityBadgeStyle = (priority) => {
    switch (priority) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-250";
      case "low":
        return "bg-sky-50 text-sky-700 border-sky-250";
      default:
        return "bg-amber-50 text-amber-700 border-amber-250";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Task Manager</span>
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {role === "admin" 
              ? "Oversee and assign tasks to managers. You cannot edit task status." 
              : role === "manager"
              ? "Assign tasks to employees and review their status updates. You cannot edit status."
              : "Track your objectives, update statuses, and submit completions."}
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-indigo-650 hover:bg-slate-50 transition-all cursor-pointer relative shadow-sm"
              title="View Alerts"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-150 rounded-2xl shadow-xl z-30 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Reminder Alerts</h4>
                  <span className="text-[10px] text-gray-400 font-bold">{notifications.length} Pending</span>
                </div>
                
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">No pending reminder alerts</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n._id} className="p-2.5 bg-slate-50 rounded-xl border border-gray-150 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-750 font-medium leading-tight">{n.message}</p>
                          <span className="text-[9px] text-gray-450 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleMarkRead(n._id)}
                          className="p-1 hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-200 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Mark as Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {role !== "employee" && (
            <button 
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer text-sm"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Tasks</span>
          <span className="text-3xl font-black text-gray-955 mt-2 font-mono">{totalCount}</span>
        </div>
        <div className="bg-amber-50/20 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Pending</span>
          <span className="text-3xl font-black text-amber-700 mt-2 font-mono">{pendingCount}</span>
        </div>
        <div className="bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">In Progress</span>
          <span className="text-3xl font-black text-indigo-700 mt-2 font-mono">{inProgressCount}</span>
        </div>
        <div className="bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Completed</span>
          <span className="text-3xl font-black text-emerald-700 mt-2 font-mono">{completedCount}</span>
        </div>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search tasks by title or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters and View toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pr-1 border-r border-gray-200">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-transparent border-0 focus:ring-0 cursor-pointer py-1"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee Filter (Admin/Manager only) */}
          {role !== "employee" && (
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pr-1 border-r border-gray-200">Assignee</span>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-0 focus:ring-0 cursor-pointer max-w-[140px] py-1"
              >
                <option value="all">All Members</option>
                {assignees.map(a => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* View Toggles */}
          <div className="flex items-center bg-gray-150 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "board" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-650"
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-650"
              }`}
              title="Detailed List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Task Layout */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center flex flex-col items-center justify-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-gray-300 animate-pulse" />
          <h3 className="font-extrabold text-gray-900 text-base">No tasks found</h3>
          <p className="text-xs text-gray-400 max-w-sm">No objectives match the current search filters or roles configuration.</p>
        </div>
      ) : viewMode === "board" ? (
        /* ================= KANBAN BOARD VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {["pending", "in-progress", "completed"].map((status) => {
            const columnTasks = filteredTasks.filter(t => t.status === status);
            let colName = "Pending";
            let colBg = "bg-slate-100/70";
            let colIcon = <Clock className="w-4 h-4 text-slate-500" />;
            
            if (status === "in-progress") {
              colName = "In Progress";
              colBg = "bg-amber-50/10";
              colIcon = <Activity className="w-4 h-4 text-amber-500" />;
            } else if (status === "completed") {
              colName = "Completed";
              colBg = "bg-emerald-50/10";
              colIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            }

            return (
              <div key={status} className={`rounded-3xl border border-gray-200/80 p-5 ${colBg} space-y-4 min-h-[300px] flex flex-col`}>
                <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                  <div className="flex items-center gap-2">
                    {colIcon}
                    <h3 className="font-black text-gray-955 text-sm tracking-tight">{colName}</h3>
                  </div>
                  <span className="bg-white text-gray-700 border border-gray-200 text-[10px] font-black font-mono px-2 py-0.5 rounded-full shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[70vh] pr-1">
                  {columnTasks.map((task) => {
                    const assignee = task.assignedTo;
                    const creator = task.assignedBy;
                    const overdue = isOverdue(task.dueDate, task.status);

                    // Target values
                    const assigneeId = assignee?._id || assignee;
                    const creatorId = creator?._id || creator;

                    // Permissions checks
                    const canEdit = role === "admin" || (role === "manager" && creatorId === currentUserId);
                    const canDelete = role === "admin" || (role === "manager" && creatorId === currentUserId);
                    
                    // Assignee can change status, creator cannot.
                    const isCurrentUserAssignee = assigneeId === currentUserId;
                    const isCurrentUserCreator = creatorId === currentUserId;

                    return (
                      <div 
                        key={task._id}
                        className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500 flex flex-col gap-3 group relative"
                      >
                        {/* Title and Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider ${priorityBadgeStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Send Alert Reminder Button (Available to Assigner only and if not completed) */}
                              {isCurrentUserCreator && task.status !== "completed" && (
                                <button
                                  onClick={() => handleSendReminderAlert(task._id)}
                                  className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Send Reminder Alert"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canEdit && (
                                <button 
                                  onClick={() => handleOpenEditModal(task)}
                                  className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Task"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canDelete && (
                                <button 
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <h4 className="font-extrabold text-gray-905 text-sm leading-snug mt-1.5 group-hover:text-indigo-650 transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Due Date Indicator */}
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${
                          overdue ? "text-rose-600 animate-pulse" : "text-gray-500"
                        }`}>
                          {overdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                          <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</span>
                          {overdue && <span className="font-extrabold text-[9px] uppercase tracking-wider bg-rose-50 border border-rose-150 px-1 py-0.2 rounded ml-1">Overdue</span>}
                        </div>

                        {/* Footer - Assignees and Actions */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Initials Avatar */}
                            <div 
                              className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0"
                              title={`Assigned to: ${assignee?.name || "Unknown"}`}
                            >
                              {getInitials(assignee?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-extrabold text-gray-800 truncate leading-none">
                                {assignee?.name || "Unassigned"}
                              </p>
                              <p className="text-[9px] text-gray-400 leading-none mt-0.5 truncate">
                                By: {creator?.name || "System"}
                              </p>
                            </div>
                          </div>

                          {/* Quick Status Control (Only visible to task Assignee) */}
                          <div className="flex items-center gap-1">
                            {isCurrentUserAssignee ? (
                              <>
                                {status === "pending" && (
                                  <button
                                    onClick={() => handleQuickStatusChange(task, "in-progress")}
                                    className="flex items-center justify-center gap-0.5 text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                                  >
                                    <span>Start</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                                {status === "in-progress" && (
                                  <button
                                    onClick={() => handleQuickStatusChange(task, "completed")}
                                    className="flex items-center justify-center gap-0.5 text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                  >
                                    <span>Complete</span>
                                    <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                )}
                                {status === "completed" && (
                                  <button
                                    onClick={() => handleQuickStatusChange(task, "in-progress")}
                                    className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-200 transition-all cursor-pointer"
                                  >
                                    Reopen
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[9px] font-bold text-gray-400 uppercase italic">Assignee only</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= LIST VIEW ================= */
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-extrabold text-gray-600 uppercase tracking-wider text-xs">Task Objective</th>
                  <th className="text-left p-4 font-extrabold text-gray-600 uppercase tracking-wider text-xs">Due Date</th>
                  <th className="text-left p-4 font-extrabold text-gray-600 uppercase tracking-wider text-xs">Priority</th>
                  <th className="text-left p-4 font-extrabold text-gray-600 uppercase tracking-wider text-xs">Assignee / Owner</th>
                  <th className="text-left p-4 font-extrabold text-gray-600 uppercase tracking-wider text-xs">Status</th>
                  <th className="text-center p-4 font-extrabold text-gray-600 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const assignee = task.assignedTo;
                  const creator = task.assignedBy;
                  const overdue = isOverdue(task.dueDate, task.status);

                  const assigneeId = assignee?._id || assignee;
                  const creatorId = creator?._id || creator;
                  
                  const canEdit = role === "admin" || (role === "manager" && creatorId === currentUserId);
                  const canDelete = role === "admin" || (role === "manager" && creatorId === currentUserId);

                  const isCurrentUserAssignee = assigneeId === currentUserId;
                  const isCurrentUserCreator = creatorId === currentUserId;

                  return (
                    <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 max-w-xs">
                        <p className="font-extrabold text-gray-955 text-sm leading-tight">{task.title}</p>
                        {task.description && (
                          <p className="text-gray-400 text-xs truncate mt-0.5">{task.description}</p>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <span className={`inline-flex items-center gap-1 font-bold ${overdue ? "text-rose-600" : "text-gray-750"}`}>
                          {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                          {overdue && <span className="text-[9px] uppercase bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200 ml-1.5 font-sans font-black">Overdue</span>}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${priorityBadgeStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 border border-indigo-150 text-indigo-700 font-black rounded-lg flex items-center justify-center text-[10px]">
                            {getInitials(assignee?.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-gray-900 text-xs truncate leading-none">{assignee?.name || "Unassigned"}</p>
                            <p className="text-[9px] text-gray-400 leading-none mt-0.5">By: {creator?.name || "System"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                          task.status === "completed" 
                            ? "text-emerald-700" 
                            : task.status === "in-progress" 
                            ? "text-amber-700" 
                            : "text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            task.status === "completed" 
                              ? "bg-emerald-500" 
                              : task.status === "in-progress" 
                              ? "bg-amber-500" 
                              : "bg-slate-400"
                          }`} />
                          {task.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Quick transitions (Only enabled for the assignee) */}
                          {isCurrentUserAssignee ? (
                            <div className="flex items-center bg-slate-50 border border-gray-200 rounded-lg p-0.5">
                              <button
                                onClick={() => handleQuickStatusChange(task, "pending")}
                                disabled={task.status === "pending"}
                                className={`px-2 py-1 text-[9px] font-black uppercase rounded transition-all cursor-pointer ${
                                  task.status === "pending" ? "bg-white text-gray-800 shadow-sm" : "text-gray-450 hover:text-gray-700"
                                }`}
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleQuickStatusChange(task, "in-progress")}
                                disabled={task.status === "in-progress"}
                                className={`px-2 py-1 text-[9px] font-black uppercase rounded transition-all cursor-pointer ${
                                  task.status === "in-progress" ? "bg-white text-amber-750 shadow-sm" : "text-gray-450 hover:text-amber-600"
                                }`}
                              >
                                Active
                              </button>
                              <button
                                onClick={() => handleQuickStatusChange(task, "completed")}
                                disabled={task.status === "completed"}
                                className={`px-2 py-1 text-[9px] font-black uppercase rounded transition-all cursor-pointer ${
                                  task.status === "completed" ? "bg-white text-emerald-750 shadow-sm" : "text-gray-450 hover:text-emerald-600"
                                }`}
                              >
                                Done
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-450 italic pr-2">Assignee Only</span>
                          )}

                          {/* Reminder Alert & Edit/Delete */}
                          <div className="flex items-center border-l border-gray-200 pl-2 gap-1">
                            {isCurrentUserCreator && task.status !== "completed" && (
                              <button
                                onClick={() => handleSendReminderAlert(task._id)}
                                className="p-1.5 hover:bg-amber-50 rounded-xl text-amber-500 hover:text-amber-700 transition-colors cursor-pointer"
                                title="Send Reminder Alert"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                            )}
                            {canEdit && (
                              <button 
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1.5 hover:bg-slate-100 rounded-xl text-gray-500 hover:text-indigo-650 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => handleDeleteTask(task._id)}
                                className="p-1.5 hover:bg-rose-50 rounded-xl text-gray-500 hover:text-rose-650 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= FORM MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={handleCloseModal}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Dialog Body */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-150 w-full max-w-lg p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span>{modalTask ? "Modify Task Objective" : "Assign New Task"}</span>
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-650 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Task Title</label>
                <input 
                  type="text"
                  placeholder="Review monthly targets, write code structure, etc..."
                  value={modalForm.title}
                  onChange={(e) => setModalForm({...modalForm, title: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Detailed Description</label>
                <textarea 
                  placeholder="Explain details, expectations, links, and deliverables..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({...modalForm, description: e.target.value})}
                  className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[90px] max-h-[160px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Assignee selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</label>
                  <select
                    value={modalForm.assignedTo}
                    onChange={(e) => setModalForm({...modalForm, assignedTo: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                    required
                  >
                    {assignees.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Level</label>
                  <select
                    value={modalForm.priority}
                    onChange={(e) => setModalForm({...modalForm, priority: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Due Date selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date Target</label>
                  <input 
                    type="date"
                    value={modalForm.dueDate}
                    onChange={(e) => setModalForm({...modalForm, dueDate: e.target.value})}
                    className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                    required
                  />
                </div>

                {/* Status Selection (only visible when editing and DISABLED for the task creator) */}
                {modalTask && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Progress Status</label>
                    <select
                      value={modalForm.status}
                      disabled={modalTask && (modalTask.assignedBy?._id === currentUserId || modalTask.assignedBy === currentUserId)}
                      onChange={(e) => setModalForm({...modalForm, status: e.target.value})}
                      className="w-full border border-gray-250 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {modalTask && (modalTask.assignedBy?._id === currentUserId || modalTask.assignedBy === currentUserId) && (
                      <span className="text-[10px] text-amber-600 block mt-1 font-bold">Only the assignee can update status.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer text-sm"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm disabled:opacity-75"
                >
                  {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{modalTask ? "Save Adjustments" : "Deploy Task"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
