import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import { 
  IndianRupee, 
  Calendar, 
  Download, 
  Printer, 
  FileText, 
  X, 
  Briefcase, 
  CheckCircle,
  Clock,
  Building,
  User,
  ArrowDownRight,
  ArrowUpRight,
  Landmark
} from "lucide-react";

const PaySlips = () => {
  const [payslips, setPayslips] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, profRes] = await Promise.all([
          api.get("/payroll/my"),
          api.get("/auth/me")
        ]);
        setPayslips(payRes.data || []);
        setProfile(profRes.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColor = (s) => {
    if (s === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "processed") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Helper to calculate statistics
  const calculateStats = () => {
    if (payslips.length === 0) return { ytdNet: 0, avgBase: 0, totalTax: 0 };
    
    const paidSlips = payslips.filter(p => p.status === "paid");
    const ytdNet = paidSlips.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const avgBase = payslips.reduce((sum, p) => sum + (p.baseSalary || 0), 0) / payslips.length;
    const totalTax = payslips.reduce((sum, p) => sum + (p.deductions || 0), 0);
    
    return { ytdNet, avgBase, totalTax };
  };

  const stats = calculateStats();

  const handlePrint = () => {
    window.print();
  };

  const handleMockDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Payslip downloaded successfully (PDF format mock triggered).");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Get month name in full
  const getMonthName = (numStr) => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const index = parseInt(numStr, 10) - 1;
    return months[index] || numStr;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Dynamic style tag to manage print layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible;
          }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="no-print">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pay Slips</h1>
        <p className="text-gray-500 text-sm mt-1">Access, print, and download your monthly salary statements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        {/* Card 1: YTD Net Earnings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">YTD Paid Earnings</p>
            <h3 className="text-2xl font-black text-gray-900 font-mono">
              ₹{stats.ytdNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Direct deposit completed
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Avg Base Salary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Average Monthly Base</p>
            <h3 className="text-2xl font-black text-gray-900 font-mono">
              ₹{stats.avgBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              General shift contract
            </p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Deductions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Accumulated Deductions</p>
            <h3 className="text-2xl font-black text-gray-900 font-mono">
              ₹{stats.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              Tax & Provident Fund (EPF)
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Payslips List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden no-print">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Salary Statements</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click any row to open the formal corporate pay stub viewer</p>
          </div>
        </div>

        {payslips.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <FileText className="w-8 h-8 text-gray-300" />
            <p className="font-semibold">No payslip logs registered yet</p>
            <p className="text-xs text-gray-400">Salary statements are issued at the end of each pay cycle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Pay Period</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Base Salary</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Allowances</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Deductions</th>
                  <th className="text-right p-4 font-semibold text-gray-600">Net Salary</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payslips.map((p) => (
                  <tr 
                    key={p._id} 
                    onClick={() => setSelectedSlip(p)}
                    className="hover:bg-indigo-50/20 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{getMonthName(p.month)} {p.year}</span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-600 font-mono">₹{(p.baseSalary ?? 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-medium text-emerald-600 font-mono">+₹{(p.allowances ?? 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-medium text-rose-600 font-mono">-₹{(p.deductions ?? 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-black text-gray-900 font-mono">₹{(p.netSalary ?? 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Stub Details Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print-overlay overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-8 animate-fade-in border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">Salary Statement Details</h3>
              </div>
              <button 
                onClick={() => setSelectedSlip(null)} 
                className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Slip Container */}
            <div id="printable-payslip" className="p-6 md:p-8 space-y-6 flex-1 bg-white">
              
              {/* Pay Slip Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <Building className="w-5 h-5" />
                    </div>
                    <span className="font-black text-lg text-gray-900 tracking-tight">HRMS Corporation</span>
                  </div>
                  <p className="text-xs text-gray-400">100 Silicon Boulevard, Tech Center</p>
                </div>
                
                <div className="text-right">
                  <h4 className="font-black text-indigo-600 text-base uppercase tracking-widest">PAY SLIP</h4>
                  <p className="text-xs text-gray-500 font-bold">{getMonthName(selectedSlip.month).toUpperCase()} {selectedSlip.year}</p>
                </div>
              </div>

              {/* Employee/Pay Details Meta Block */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div className="space-y-1">
                  <p className="flex gap-2"><span className="text-gray-400 font-semibold w-24">Employee Name:</span> <span className="font-bold text-gray-900">{profile?.name}</span></p>
                  <p className="flex gap-2"><span className="text-gray-400 font-semibold w-24">Designation:</span> <span className="font-bold text-gray-700 capitalize">{profile?.role}</span></p>
                  <p className="flex gap-2"><span className="text-gray-400 font-semibold w-24">Employee ID:</span> <span className="font-mono text-gray-600">{profile?._id}</span></p>
                </div>
                <div className="space-y-1 text-right sm:text-left sm:pl-8">
                  <p className="flex justify-between sm:justify-start gap-2"><span className="text-gray-400 font-semibold w-24">Statement Date:</span> <span className="font-bold text-gray-700">{selectedSlip.paidAt ? new Date(selectedSlip.paidAt).toLocaleDateString() : "Pending"}</span></p>
                  <p className="flex justify-between sm:justify-start gap-2"><span className="text-gray-400 font-semibold w-24">Payment Status:</span> <span className="font-bold uppercase text-emerald-600">{selectedSlip.status}</span></p>
                  <p className="flex justify-between sm:justify-start gap-2"><span className="text-gray-400 font-semibold w-24">Payment Method:</span> <span className="font-bold text-gray-700 capitalize">{selectedSlip.paymentMethod || "Bank Transfer"}</span></p>
                </div>
              </div>

              {/* Disbursement & Bank Details Block */}
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2">
                <h5 className="font-black text-gray-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-gray-500" />
                  Disbursement & Bank Details
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pt-1">
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-gray-450 font-semibold w-28 text-left">Bank Name:</span>
                    <span className="font-bold text-gray-800">{profile?.bankDetails?.bankName || "—"}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-gray-450 font-semibold w-28 text-left">Branch Name:</span>
                    <span className="font-bold text-gray-800">{profile?.bankDetails?.branchName || "—"}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-gray-450 font-semibold w-28 text-left">Account Number:</span>
                    <span className="font-mono font-bold text-gray-800">
                      {profile?.bankDetails?.accountNumber ? `•••• •••• •••• ${profile.bankDetails.accountNumber.slice(-4)}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-gray-450 font-semibold w-28 text-left">IFSC Code:</span>
                    <span className="font-mono font-bold text-gray-800">{profile?.bankDetails?.ifscCode || "—"}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-gray-450 font-semibold w-28 text-left">Transaction ID:</span>
                    <span className="font-mono font-bold text-indigo-650">{selectedSlip.transactionId || "—"}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-2">
                    <span className="text-gray-450 font-semibold w-28 text-left">Disbursement Date:</span>
                    <span className="font-bold text-gray-800">
                      {selectedSlip.paidAt ? new Date(selectedSlip.paidAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary Breakdown (Earnings vs Deductions) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Earnings */}
                <div className="space-y-3">
                  <h5 className="font-black text-gray-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">Earnings</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Basic Base Salary</span>
                      <span className="font-mono font-bold text-gray-800">₹{(selectedSlip.baseSalary ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">House Rent Allowance (HRA)</span>
                      <span className="font-mono font-bold text-emerald-600">+₹{((selectedSlip.allowances ?? 0) * 0.4).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Conveyance & Travel</span>
                      <span className="font-mono font-bold text-emerald-600">+₹{((selectedSlip.allowances ?? 0) * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Special Allowance</span>
                      <span className="font-mono font-bold text-emerald-600">+₹{((selectedSlip.allowances ?? 0) * 0.3).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total Earnings</span>
                      <span className="font-mono">₹{((selectedSlip.baseSalary ?? 0) + (selectedSlip.allowances ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <h5 className="font-black text-gray-800 text-xs uppercase tracking-wider border-b border-gray-100 pb-2">Deductions</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Provident Fund (EPF)</span>
                      <span className="font-mono font-bold text-rose-600">-₹{((selectedSlip.deductions ?? 0) * 0.6).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Professional Tax</span>
                      <span className="font-mono font-bold text-rose-600">-₹{((selectedSlip.deductions ?? 0) * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Loss of Pay (LOP) / Leave</span>
                      <span className="font-mono font-bold text-rose-600">-₹{((selectedSlip.deductions ?? 0) * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-600">-₹{(selectedSlip.deductions ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Net Salary Highlight Footer */}
              <div className="bg-indigo-600 text-white rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Net Payable Amount</span>
                  <p className="text-xs font-semibold text-indigo-100 italic">Direct Deposit Complete</p>
                </div>
                <div className="text-2xl font-black font-mono tracking-wide">
                  ₹{selectedSlip.netSalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Note / Disclaimer */}
              <div className="text-center text-[10px] text-gray-400 italic pt-4">
                This is a system-generated salary slip and does not require an authorized signature.
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 no-print">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                Print Statement
              </button>
              
              <button 
                onClick={handleMockDownload}
                disabled={downloading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {downloading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? "Generating PDF..." : "Download Statement"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PaySlips;
