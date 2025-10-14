import React from "react";
import { useGetTeacherSalaryQuery } from "../redux/apis/salaryApi";
import { Loader2 } from "lucide-react";

const Salary = () => {
  const { data, isLoading } = useGetTeacherSalaryQuery();

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded-full";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300 px-3 py-1 rounded-full";
      case "unpaid":
        return "bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-full";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  }

  if (!data?.success) {
    return <p className="text-center mt-10 text-red-500">No salary data found.</p>;
  }

  const { teacher, totals, payments } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-10">💰 My Salary Records</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
            <h3 className="text-gray-500">Base Salary</h3>
            <p className="text-2xl font-bold text-indigo-600">₹{teacher.baseSalary.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
            <h3 className="text-gray-500">Total Paid</h3>
            <p className="text-2xl font-bold text-green-600">₹{totals.totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
            <h3 className="text-gray-500">Total Pending</h3>
            <p className="text-2xl font-bold text-red-600">₹{totals.totalPending.toLocaleString()}</p>
          </div>
        </div>

        {/* Salary Table */}
        <div className="bg-white text-black shadow-xl rounded-3xl p-6 overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Month</th>
                <th className="px-6 py-3 text-left font-medium">Base Salary</th>
                <th className="px-6 py-3 text-left font-medium">Paid Amount</th>
                <th className="px-6 py-3 text-left font-medium">Pending Amount</th>
                <th className="px-6 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 border-b">{p.month}</td>
                  <td className="px-6 py-3 border-b">₹{p.baseSalary.toLocaleString()}</td>
                  <td className="px-6 py-3 border-b">₹{p.paidAmount.toLocaleString()}</td>
                  <td className="px-6 py-3 border-b">₹{p.pendingAmount.toLocaleString()}</td>
                  <td className="px-6 py-3 border-b text-center">
                    <span className={getStatusClass(p.paymentStatus)}>{p.paymentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salary;
