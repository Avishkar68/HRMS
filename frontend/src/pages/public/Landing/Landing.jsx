import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ChevronDown, 
  ArrowRight, 
  MessageSquare, 
  Menu, 
  X, 
  FileText,
  Zap,
  Globe,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
  Users
} from "lucide-react";

const Landing = () => {
  // Navigation states
  const [activeDropdown, setActiveDropdown] = useState(null); // 'features', 'resources', 'about', or null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Testimonial states
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    {
      quote: "The geofenced check-in system completely changed our operations. Employees mark attendance using their browsers, which matches their coordinate location against our 200m range limit. It saved our HR managers days of manual tracking and prevents remote check-in fraud.",
      author: "Cheri Charles",
      role: "HR Operations Admin"
    },
    {
      quote: "The multi-tenant architecture is extremely powerful. We were able to onboard three subsidiary company accounts in minutes. Managers have absolute control over leave approvals, timesheet verifications, and performance evaluations for their direct reports.",
      author: "Marcus Vance",
      role: "Regional Operations Director"
    },
    {
      quote: "I love how simple task assignment and payroll are. Payroll automatically checks my active working days (excluding weekends), validates my bank details, and allows me to download PDF payslips instantly.",
      author: "Samantha K.",
      role: "Senior Software Developer & Employee"
    }
  ];

  // FAQ states
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      id: 0,
      question: "How does the geofenced check-in system work?",
      answer: "Using the browser's Geolocation API, the platform captures the employee's coordinates (latitude and longitude) and calculates the geodesic distance to the office coordinates. If they are within 200 meters, they can log in/out; otherwise, check-ins are restricted to ensure physical presence."
    },
    {
      id: 1,
      question: "What is the digital Service Book feature?",
      answer: "The digital Service Book logs a permanent timeline of employee career milestones. Admins and managers can record milestones like promotions, transfers, salary increments, warnings, and trainings along with official office order reference numbers."
    },
    {
      id: 2,
      question: "How are tasks and appraisals delegated?",
      answer: "The system enforces hierarchical permissions. Admins assign tasks to managers. Managers assign tasks and reviews to employees reporting directly to them. Employees cannot assign tasks; they focus on updates and self-evaluations."
    },
    {
      id: 3,
      question: "How is payroll calculated under the hood?",
      answer: "Our backend queries the number of working days in a month (excluding Saturdays and Sundays) and divides the employee's check-in records against it. It multiplies this ratio by their base salary and aggregates allowances and deductions to generate a draft payslip."
    }
  ];

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#334155] font-sans relative overflow-x-hidden">
      
      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#cbd5e1]/30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-[#303f9f] flex items-center">
                  the <span className="text-[#3b82f6] font-extrabold ml-1">workspace</span>
                  <span className="text-xs text-[#64748b] align-super font-medium ml-0.5">.app</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden md:flex items-center space-x-8">
              
              {/* Features Dropdown Link */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown("features")}
                  className={`flex items-center text-sm font-medium hover:text-[#3b82f6] transition-colors py-2 ${activeDropdown === "features" ? "text-[#3b82f6]" : "text-[#64748b]"}`}
                >
                  Features <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${activeDropdown === "features" ? "rotate-180" : ""}`} />
                </button>

                {/* Features Mega Menu Dropdown */}
                {activeDropdown === "features" && (
                  <>
                    <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-[680px] bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 z-20 grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      <div className="col-span-4 space-y-4">
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">Workforce Operations</h4>
                        <ul className="space-y-3">
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Geofenced Attendance</span>
                              <span className="text-[11px] text-[#64748b] font-light block">GPS range checks & time logs</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Hierarchical Tasks</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Role-bounded assignment</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Timesheets Logging</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Client & project hours log</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="col-span-4 space-y-4">
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">Talent & Milestones</h4>
                        <ul className="space-y-3">
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Recruitment (ATS)</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Job postings & applicant board</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Appraisals & Reviews</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Self & manager score cards</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Digital Service Book</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Permanent career logs</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="col-span-4 space-y-4">
                        <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">Finance & Admin</h4>
                        <ul className="space-y-3">
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Automated Payroll</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Attendance-based pay & slips</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Leave Management</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Approval workflow & balances</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/signin" className="group block" onClick={() => setActiveDropdown(null)}>
                              <span className="text-sm font-semibold text-[#1e293b] group-hover:text-[#3b82f6] block">Document Archive</span>
                              <span className="text-[11px] text-[#64748b] font-light block">Employee onboarding records</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="col-span-12 border-t border-[#e2e8f0] pt-4 mt-2 flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                          <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest">Multi-Tenant Onboarding</span>
                          <Link to="/superadmin/login" onClick={() => setActiveDropdown(null)} className="text-xs text-[#475569] font-medium hover:text-[#3b82f6]">Super Admin Access</Link>
                        </div>
                        <Link 
                          to="/signin" 
                          onClick={() => setActiveDropdown(null)}
                          className="text-xs font-semibold text-[#3b82f6] hover:text-[#303f9f] flex items-center space-x-1"
                        >
                          <span>Explore Demo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  </>
                )}
              </div>

              {/* Company Portal Link */}
              <Link to="/signin" className="text-sm font-medium text-[#64748b] hover:text-[#3b82f6] transition-colors">
                Company Portal
              </Link>

              {/* Super Admin Access */}
              <Link to="/superadmin/login" className="text-sm font-medium text-[#64748b] hover:text-[#3b82f6] transition-colors">
                Super Admin
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/signin" 
                className="text-sm font-medium text-[#64748b] hover:text-[#3b82f6] transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="px-6 py-2 rounded-full text-sm font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Account
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#64748b] hover:text-[#3b82f6] focus:outline-none p-1"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e2e8f0] bg-white px-4 py-4 space-y-3 shadow-lg">
            <Link 
              to="/signin" 
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#3b82f6]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Employee Portal
            </Link>
            <Link 
              to="/superadmin/login" 
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#3b82f6]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Super Admin Portal
            </Link>
            <div className="border-t border-[#e2e8f0] pt-4 flex flex-col space-y-2">
              <Link 
                to="/signin" 
                className="w-full text-center py-2.5 text-sm font-medium text-[#64748b] hover:text-[#3b82f6]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="w-full text-center py-2.5 rounded-full text-sm font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full text-[11px] font-semibold text-[#3b82f6] mb-8">
          <Zap className="w-3.5 h-3.5 fill-[#3b82f6] text-[#3b82f6]" />
          <span>Multi-Tenant Enterprise HRMS Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#1e293b] leading-[1.15] max-w-4xl tracking-tight">
          Workforce Operations, <br />
          <span className="text-[#3b82f6]">Insights, and HR Automation</span>
        </h1>

        {/* Hero Description */}
        <p className="mt-6 text-base sm:text-lg text-[#64748b] font-light max-w-3xl leading-relaxed">
          Manage your organization with geofenced attendance check-ins, automated salary generation, 
          leave approval flows, career milestone tracking, and task delegation—all isolated in a secure, 
          multi-tenant dashboard.
        </p>

        {/* Email and CTA row */}
        <div className="mt-10 w-full max-w-lg flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl sm:rounded-full border border-[#cbd5e1]/80 shadow-lg shadow-blue-900/5">
          <input 
            type="email" 
            placeholder="Enter corporate email" 
            className="w-full bg-transparent px-5 py-2.5 outline-none text-sm text-[#1e293b] placeholder-[#94a3b8] rounded-full font-light"
          />
          <Link 
            to="/signup" 
            className="w-full sm:w-auto shrink-0 bg-[#3b82f6] text-white font-semibold text-sm px-8 py-3.5 rounded-xl sm:rounded-full hover:bg-[#2563eb] transition-all flex items-center justify-center space-x-1 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Secondary Portal CTA */}
        <div className="mt-5">
          <Link 
            to="/signin" 
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-semibold bg-[#e2e8f0]/60 text-[#475569] hover:bg-[#e2e8f0] hover:text-[#1e293b] transition-all"
          >
            Explore Dashboard Demo
          </Link>
        </div>

      </section>

      {/* ================= COMPLETE HR & WORKFORCE SUITE SECTION ================= */}
      <section className="py-24 bg-[#f1f5f9]/50 border-y border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
              Complete HR and Workforce Suite
            </h2>
            <p className="mt-4 text-sm font-light text-[#64748b] leading-relaxed">
              A fully integrated, multi-tenant system built to manage, track, and automate every stage of the employee lifecycle.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Geofenced Attendance */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">📍 Geofenced Attendance</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Restrict employee clock-in/out to a configurable range (e.g., 200m office radius) with automatic browser coordinate validation using the Haversine formula.
              </p>
            </div>

            {/* Feature 2: Automated Payroll */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">💰 Automated Payroll</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Automatically generate draft payslips calculated from actual check-in logs, weekend-excluded working days, custom allowances, and deductions.
              </p>
            </div>

            {/* Feature 3: Leave Management */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">📅 Leave Workflows</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Dynamic submission and manager approval pipelines with real-time balance tracking for Sick, Casual, and Paid leave categories.
              </p>
            </div>

            {/* Feature 4: Hierarchical Tasks */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">🪜 Hierarchical Tasks</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Enforce assignment workflow boundaries where Admins delegate tasks to Managers, and Managers assign and monitor tasks for reporting employees.
              </p>
            </div>

            {/* Feature 5: Performance Appraisals */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">🏆 Appraisals & Feedback</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Track appraisals with structured review cycles. Employees submit self-ratings, while direct supervisors record performance feedback.
              </p>
            </div>

            {/* Feature 6: Digital Service Book */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">📜 Career Service Book</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Permanent, official career log of transfers, promotions, increments, warnings, and trainings tied to unique office order reference numbers.
              </p>
            </div>

            {/* Feature 7: Timesheets Logging */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">⏱️ Timesheet Tracking</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Standardized logging of weekly/daily task hours showing descriptions, clients, and projects for exact billing and performance reviews.
              </p>
            </div>

            {/* Feature 8: Recruitment ATS */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">👥 Recruitment Portal</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Publish company job postings and track applicant status from Applied, to Interviewing, Offered, or Rejected inside a clean Kanban-style workflow.
              </p>
            </div>

            {/* Feature 9: Multi-Tenant SaaS */}
            <div className="bg-white border border-[#cbd5e1]/30 rounded-2xl p-6 shadow-sm shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3b82f6] group-hover:bg-[#3b82f6] group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1e293b] mb-2">🌐 Multi-Tenant SaaS</h3>
              <p className="text-xs font-light text-[#64748b] leading-relaxed">
                Onboard isolated company databases instantly. Super Admin manages corporate tenants, subscription tiers, and first tenant admins with complete data security.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">
          Don’t just take it from us
        </h2>

        {/* Carousel Content */}
        <div className="mt-12 relative px-8 sm:px-16 min-h-[220px] flex flex-col justify-center">
          
          {/* Quote Mark Icon */}
          <span className="text-6xl text-[#3b82f6]/10 font-serif absolute top-0 left-6 sm:left-12">“</span>
          
          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed italic relative z-10">
            {testimonials[currentTestimonial].quote}
          </p>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[#1e293b]">{testimonials[currentTestimonial].author}</h4>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
              {testimonials[currentTestimonial].role}
            </p>
          </div>

          {/* Left Arrow Button */}
          <button 
            onClick={handlePrevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#64748b] hover:text-[#1e293b] transition-all cursor-pointer shadow-sm"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button 
            onClick={handleNextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#64748b] hover:text-[#1e293b] transition-all cursor-pointer shadow-sm"
            aria-label="Next Testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

        {/* Carousel Indicators */}
        <div className="mt-6 flex justify-center space-x-2">
          {testimonials.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentTestimonial(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${currentTestimonial === idx ? "bg-[#3b82f6] w-6" : "bg-[#cbd5e1]"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-24 bg-white border-t border-[#cbd5e1]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <h2 className="text-3xl font-extrabold text-[#1e293b] text-center tracking-tight">
            Frequently asked questions
          </h2>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="border-b border-[#cbd5e1]/30 pb-4 transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between py-3 text-left focus:outline-none group"
                  >
                    <span className="text-sm font-medium text-[#334155] group-hover:text-[#3b82f6] transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#64748b] transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180 text-[#3b82f6]" : ""}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-45 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                  >
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-tight text-white flex items-center">
              the <span className="text-[#3b82f6] font-extrabold ml-1">workspace</span>
              <span className="text-xs text-gray-400 align-super font-medium ml-0.5">.app</span>
            </span>
            <p className="text-xs leading-relaxed text-slate-400 font-light">
              A comprehensive, multi-tenant workforce operations platform. Structuring geofenced attendance logs, automated payroll calculations, and corporate milestone management.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Platform Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/signin" className="hover:text-white transition-colors">Log In Portal</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up Tenant</Link></li>
              <li><Link to="/superadmin/login" className="hover:text-white transition-colors">Super Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Employee Suite</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/signin" className="hover:text-white transition-colors">Mark Geofenced Attendance</Link></li>
              <li><Link to="/signin" className="hover:text-white transition-colors">Request Leave</Link></li>
              <li><Link to="/signin" className="hover:text-white transition-colors">Download Payslips</Link></li>
              <li><Link to="/signin" className="hover:text-white transition-colors">My Career Service Book</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">System Details</h4>
            <ul className="space-y-2 text-xs text-gray-500 font-light">
              <li>Built with React 19 & Node.js</li>
              <li>MongoDB Mongoose Database</li>
              <li>Role-Based Guards Auth</li>
              <li>Coordinate Range Verification</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800/80 text-center text-[10px] text-gray-600 font-light">
          <p>© {new Date().getFullYear()} Workspace HRMS Platform. All rights reserved. Designed for enterprise workforce management.</p>
        </div>
      </footer>

      {/* ================= FLOATING CHAT ICON ================= */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => alert("Workspace Support: Need assistance configuring your company tenant or checking in? Contact support@workspace.app or sign in to open a support ticket.")}
          className="w-14 h-14 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Contact support chat"
        >
          <MessageSquare className="w-6 h-6 fill-white" />
        </button>
      </div>

    </div>
  );
};

export default Landing;