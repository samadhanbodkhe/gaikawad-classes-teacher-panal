import React, { useState, useMemo } from "react";
import { useGetAttendanceTeachersQuery } from "../redux/apis/attendanceApi";
import { FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt } from "react-icons/fa";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const Attendance = () => {
  const { data, isLoading, error } = useGetAttendanceTeachersQuery();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'list'

  const attendanceData = data?.attendances || [];

  // Sort by latest date
  const sortedData = [...attendanceData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Get current month and year for calendar
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const endDate = lastDayOfMonth.getDate();

    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= endDate; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateStr = date.toDateString();
      const attendance = sortedData.find(att => 
        new Date(att.date).toDateString() === dateStr
      );
      days.push({
        date,
        day: i,
        attendance,
        isToday: date.toDateString() === new Date().toDateString(),
        isCurrentMonth: true
      });
    }

    return days;
  }, [currentMonth, currentYear, sortedData]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return <FaCheckCircle className="text-green-600" />;
      case "absent":
        return <FaTimesCircle className="text-red-600" />;
      case "leave":
        return <FaClock className="text-yellow-600" />;
      default:
        return null;
    }
  };

  // Get month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={30} />
        <span className="ml-2">Loading attendance records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-600">
          <FaTimesCircle className="mx-auto text-4xl mb-2" />
          <p>Error fetching attendance records.</p>
          <p className="text-sm text-gray-600 mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            📅 My Attendance History
          </h1>
          <p className="text-gray-600">
            Track your daily attendance records and history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sortedData.filter(att => att.status.toLowerCase() === "present").length}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent Days</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sortedData.filter(att => att.status.toLowerCase() === "absent").length}
                </p>
              </div>
              <FaTimesCircle className="text-red-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leave Days</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sortedData.filter(att => att.status.toLowerCase() === "leave").length}
                </p>
              </div>
              <FaClock className="text-yellow-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "calendar"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaCalendarAlt className="inline mr-2" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              List View
            </button>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6">
          {viewMode === "calendar" ? (
            /* Calendar View */
            <div className="calendar-view">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-bold text-gray-800">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-20 p-2 border rounded-lg ${
                      day?.isToday 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200"
                    } ${
                      !day?.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                    }`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-medium ${
                            day.isToday ? "text-blue-600" : "text-gray-700"
                          }`}>
                            {day.day}
                          </span>
                          {day.attendance && getStatusIcon(day.attendance.status)}
                        </div>
                        
                        {day.attendance && (
                          <div className={`text-xs px-2 py-1 rounded-full text-center mt-1 ${getStatusStyle(day.attendance.status)}`}>
                            {day.attendance.status}
                          </div>
                        )}
                        
                        {day.isToday && !day.attendance && (
                          <div className="text-xs text-gray-500 text-center mt-2">
                            No record
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Today</span>
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="list-view">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                All Attendance Records
              </h3>
              
              {sortedData.length === 0 ? (
                <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No attendance records found.</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Your attendance records will appear here once marked.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedData.map((att) => {
                    const isToday = new Date(att.date).toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={att._id}
                        className={`flex flex-col md:flex-row items-center justify-between border rounded-xl px-4 py-3 transition-all hover:shadow-md ${
                          isToday 
                            ? "bg-green-50 border-green-300 shadow-sm" 
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className={`text-lg font-semibold ${
                              isToday ? "text-green-700" : "text-gray-800"
                            }`}>
                              {formatDate(att.date)}
                            </p>
                            {isToday && (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                Today
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Marked by: <span className="font-semibold">{att.markedBy}</span>
                            {att.reason && (
                              <span className="ml-3">
                                Reason: <span className="font-medium">{att.reason}</span>
                              </span>
                            )}
                          </p>
                        </div>

                        <div
                          className={`mt-2 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(
                            att.status
                          )}`}
                        >
                          {getStatusIcon(att.status)}
                          <span className="capitalize">{att.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Total Records: {sortedData.length} • Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Attendance;