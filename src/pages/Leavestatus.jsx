import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useCreateLeaveMutation,
  useGetLeaveRequestsByTeacherQuery,
} from "../redux/apis/leaveApi";
import { Loader2 } from "lucide-react";

const LeaveManagement = () => {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    leaveType: "",
    reason: "",
  });

  const [createLeave, { isLoading: isCreating }] = useCreateLeaveMutation();
  const { data: leaves, isLoading, refetch } = useGetLeaveRequestsByTeacherQuery();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.leaveType) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const res = await createLeave(form).unwrap();
      toast.success("✅ Leave request submitted successfully!");
      setForm({ fromDate: "", toDate: "", leaveType: "", reason: "" });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-5">
      <ToastContainer position="top-right" />

      {/* Title */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center text-4xl md:text-5xl font-extrabold text-gray-800 mb-8"
      >
        📝 Leave Management
      </motion.h1>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-white  shadow-xl rounded-2xl p-8 mb-12 border border-gray-200"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          Apply for Leave
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              From Date *
            </label>
            <input
              type="date"
              name="fromDate"
              value={form.fromDate}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">
              To Date *
            </label>
            <input
              type="date"
              name="toDate"
              value={form.toDate}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Paid Leave">Paid Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              rows="3"
              value={form.reason}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            ></textarea>
          </div>

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition flex items-center gap-2 justify-center"
            >
              {isCreating && <Loader2 className="animate-spin" size={18} />}
              Submit Leave
            </button>
          </div>
        </form>
      </motion.div>

      {/* Leave Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8 border border-gray-200"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 text-center">
          Leave History
        </h2>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : !leaves?.length ? (
          <p className="text-center text-gray-500">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-xl">
              <thead className="bg-indigo-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">From</th>
                  <th className="px-4 py-3 text-left">To</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50  text-black transition">
                    <td className="px-4 py-3 border-b">
                      {new Date(leave.fromDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {new Date(leave.toDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-b">{leave.leaveType}</td>
                    <td className="px-4 py-3 border-b">
                      {leave.reason || "-"}
                    </td>
                    <td
                      className={`px-4 py-3 border-b text-center font-semibold rounded-lg ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {leave.status || "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveManagement;
