import React from "react";
import { FaUsers, FaMoneyCheckAlt, FaTasks, FaCalendarAlt } from "react-icons/fa";

const Dashboard = () => {
  // Summary cards data
  const summary = [
    { title: "Total Teachers", value: 25, icon: <FaUsers className="text-2xl text-white" />, bg: "bg-blue-500" },
    { title: "Pending Salary", value: "₹87,000", icon: <FaMoneyCheckAlt className="text-2xl text-white" />, bg: "bg-green-500" },
    { title: "Pending Leaves", value: 5, icon: <FaTasks className="text-2xl text-white" />, bg: "bg-yellow-500" },
    { title: "Upcoming Classes", value: 12, icon: <FaCalendarAlt className="text-2xl text-white" />, bg: "bg-purple-500" },
  ];

  // Dummy attendance data
  const attendanceData = [
    { day: "Mon", present: 20, absent: 5 },
    { day: "Tue", present: 22, absent: 3 },
    { day: "Wed", present: 18, absent: 7 },
    { day: "Thu", present: 21, absent: 4 },
    { day: "Fri", present: 23, absent: 2 },
  ];

  // Dummy salary data
  const salaryData = [
    { teacher: "Amit Sharma", month: "Sep 2025", amount: "₹45,000" },
    { teacher: "Priya Desai", month: "Sep 2025", amount: "₹42,000" },
    { teacher: "Rahul Joshi", month: "Sep 2025", amount: "₹48,000" },
    { teacher: "Neha Verma", month: "Sep 2025", amount: "₹40,000" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summary.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-5 bg-white rounded-lg shadow hover:shadow-xl transition">
            <div>
              <p className="text-gray-500">{item.title}</p>
              <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
            </div>
            <div className={`p-4 rounded-lg ${item.bg}`}>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Attendance Overview</h2>
          <div className="space-y-2">
            {attendanceData.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="w-16 font-medium">{item.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-5 relative">
                  <div
                    className="bg-green-500 h-5 rounded-full"
                    style={{ width: `${(item.present / 25) * 100}%` }}
                  ></div>
                  <div
                    className="bg-red-500 h-5 rounded-full absolute top-0 left-0"
                    style={{ width: `${(item.absent / 25) * 100}%` }}
                  ></div>
                </div>
                <span className="w-16 text-sm text-gray-600">
                  P:{item.present} A:{item.absent}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Salary Overview</h2>
          <div className="space-y-2">
            {salaryData.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">{item.teacher}</span>
                <span className="text-sm text-gray-600">{item.month}</span>
                <span className="font-semibold text-blue-600">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
