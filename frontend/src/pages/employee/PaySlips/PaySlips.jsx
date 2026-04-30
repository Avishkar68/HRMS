import React, { useEffect, useState } from "react";
import api from "../../../utils/api";

const PaySlips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const res = await api.get("/payroll/my");
        setPayslips(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const statusColor = (s) => {
    if (s === "paid") return "bg-emerald-100 text-emerald-800";
    if (s === "processed") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pay Slips</h1>
        <p className="text-gray-500 text-sm mt-1">Your salary history</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {payslips.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No payslips yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Month / Year</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Base</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Allowances</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Deductions</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Net</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payslips.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{p.month} / {p.year}</td>
                    <td className="p-4 text-right text-gray-600">{(p.baseSalary ?? 0).toLocaleString()}</td>
                    <td className="p-4 text-right text-gray-600">{(p.allowances ?? 0).toLocaleString()}</td>
                    <td className="p-4 text-right text-gray-600">{(p.deductions ?? 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-semibold text-gray-900">{(p.netSalary ?? 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaySlips;
