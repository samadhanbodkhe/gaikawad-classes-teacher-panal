import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LeaveRequest = () => {
  const [leaveData, setLeaveData] = useState({
    fromDate: "",
    toDate: "",
    leaveType: "",
    reason: "",
  });

  const today = new Date().toISOString().split("T")[0]; // current date

  const inputClass =
    "w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition shadow-sm";

  const buttonClass =
    "px-6 py-3 font-semibold rounded-xl text-white shadow-lg transition duration-300 transform hover:scale-105";

  const handleSubmit = async () => {
    const { fromDate, toDate, leaveType, reason } = leaveData;
    if (!fromDate || !toDate || !leaveType || !reason) {
      toast.error("❌ Please fill all fields", { autoClose: 3000 });
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("❌ From date cannot be after To date", { autoClose: 3000 });
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/v1/leaveRequest/createLeaveRequest",
        leaveData
      );
      toast.success("✅ Leave request submitted!", { autoClose: 3000 });
      setLeaveData({ fromDate: "", toDate: "", leaveType: "", reason: "" });
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to submit leave request", { autoClose: 3000 });
    }
  };

  const SectionCard = ({ title, children }) => (
    <div className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition duration-300">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10">
      <ToastContainer />
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-4xl sm:text-5xl text-gray-500 text-center mb-10">
          Leave Request Form
        </h1>

        <SectionCard title="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={leaveData.fromDate}
                min={today}
                onChange={(e) =>
                  setLeaveData({ ...leaveData, fromDate: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={leaveData.toDate}
                min={leaveData.fromDate || today}
                onChange={(e) =>
                  setLeaveData({ ...leaveData, toDate: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Leave Type
              </label>
              <select
                value={leaveData.leaveType}
                onChange={(e) =>
                  setLeaveData({ ...leaveData, leaveType: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select Type</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Paid">Paid Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Emergency">Emergency Leave</option>
                <option value="Study">Study Leave</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Reason
              </label>
              <textarea
                placeholder="Enter reason..."
                value={leaveData.reason}
                onChange={(e) =>
                  setLeaveData({ ...leaveData, reason: e.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              className={
                buttonClass +
                " bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500"
              }
              onClick={handleSubmit}
            >
              Submit Leave Request
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default LeaveRequest;
