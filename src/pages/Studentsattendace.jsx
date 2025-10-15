import React, { useState, useEffect, useRef } from "react";
import {
  useMarkAttendanceMutation,
  useToggleAttendanceMutation,
  useGetClassAttendanceQuery,
  useGetStudentHistoryQuery,
  useGenerateAttendancePDFMutation,
} from "../redux/apis/studentAttendanceApi";
import { useGetAllStudentsQuery } from "../redux/apis/createStudentApi";
import { 
  FaHistory, 
  FaTimes, 
  FaEdit, 
  FaChartBar, 
  FaUser, 
  FaPhone, 
  FaIdCard, 
  FaDownload,
  FaCalendar,
  FaFilePdf,
  FaSchool,
  FaCheck,
  FaTimesCircle
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentsAttendance = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceReasons, setAttendanceReasons] = useState({});
  const [attendanceNotes, setAttendanceNotes] = useState({});
  const [message, setMessage] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [editData, setEditData] = useState({ 
    id: "", 
    currentStatus: "", 
    newStatus: "", 
    studentName: "", 
    rollNumber: "",
    className: "",
    section: "",
    reason: "",
    notes: ""
  });
  const [pdfPeriod, setPdfPeriod] = useState({ type: "month", month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const { data: studentsData } = useGetAllStudentsQuery();
  const [markAttendance] = useMarkAttendanceMutation();
  const [toggleAttendance] = useToggleAttendanceMutation();
  const [generatePDF] = useGenerateAttendancePDFMutation();

  const { data: attendanceData, refetch } = useGetClassAttendanceQuery(
    { className: selectedClass, section: selectedSection, date: selectedDate },
    { skip: !selectedClass }
  );

  const { data: historyData } = useGetStudentHistoryQuery(
    { 
      studentId: selectedStudent?._id,
      month: pdfPeriod.month,
      year: pdfPeriod.year
    },
    { skip: !selectedStudent }
  );

  // Refs for modal closing
  const historyModalRef = useRef(null);
  const studentModalRef = useRef(null);
  const editModalRef = useRef(null);
  const pdfModalRef = useRef(null);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyModalRef.current && !historyModalRef.current.contains(event.target)) {
        setShowHistoryModal(false);
      }
      if (studentModalRef.current && !studentModalRef.current.contains(event.target)) {
        setShowStudentModal(false);
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
      }
      if (pdfModalRef.current && !pdfModalRef.current.contains(event.target)) {
        setShowPDFModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique classes and sections
  const classes = [...new Set(studentsData?.data?.map(s => s.className).filter(Boolean))];
  const sections = [...new Set(studentsData?.data?.filter(s => s.className === selectedClass).map(s => s.section).filter(Boolean))];

  // Filter students by selected class and section
  const filteredStudents = studentsData?.data?.filter(s => 
    s.className === selectedClass && s.section === selectedSection
  ) || [];

  // Initialize attendance status from existing data
  useEffect(() => {
    if (attendanceData?.data) {
      const statusMap = {};
      const reasonMap = {};
      const notesMap = {};

      attendanceData.data.forEach(item => {
        if (item.attendance) {
          statusMap[item.student._id] = item.attendance.status;
          reasonMap[item.student._id] = item.attendance.reason || "";
          notesMap[item.student._id] = item.attendance.notes || "";
        }
      });

      setAttendanceStatus(statusMap);
      setAttendanceReasons(reasonMap);
      setAttendanceNotes(notesMap);
    }
  }, [attendanceData]);

  // Handle individual attendance
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));

    // If marking present, clear reason and notes
    if (status === "Present") {
      setAttendanceReasons(prev => ({
        ...prev,
        [studentId]: ""
      }));
      setAttendanceNotes(prev => ({
        ...prev,
        [studentId]: ""
      }));
    }
  };

  // Handle reason change
  const handleReasonChange = (studentId, reason) => {
    setAttendanceReasons(prev => ({
      ...prev,
      [studentId]: reason
    }));
  };

  // Handle notes change
  const handleNotesChange = (studentId, notes) => {
    setAttendanceNotes(prev => ({
      ...prev,
      [studentId]: notes
    }));
  };

  // Handle bulk attendance
  const handleBulkAction = () => {
    if (!bulkAction) return;

    const newStatus = { ...attendanceStatus };
    const newReasons = { ...attendanceReasons };
    const newNotes = { ...attendanceNotes };

    filteredStudents.forEach(student => {
      newStatus[student._id] = bulkAction;
      if (bulkAction === "Absent") {
        newReasons[student._id] = "Not Specified";
      } else {
        newReasons[student._id] = "";
        newNotes[student._id] = "";
      }
    });

    setAttendanceStatus(newStatus);
    setAttendanceReasons(newReasons);
    setAttendanceNotes(newNotes);
    setBulkAction("");
  };

  // Save all attendance
  const saveAttendance = async () => {
    try {
      const attendanceDataToSend = filteredStudents
        .filter(student => attendanceStatus[student._id]) // Only include students with marked status
        .map(student => ({
          studentId: student._id,
          status: attendanceStatus[student._id],
          session: "Full Day",
          reason: attendanceStatus[student._id] === "Absent" ? attendanceReasons[student._id] : "",
          notes: attendanceNotes[student._id] || ""
        }));

      if (attendanceDataToSend.length === 0) {
        toast.warning("⚠️ Please mark attendance for at least one student");
        return;
      }

      await markAttendance({
        attendanceData: attendanceDataToSend,
        date: selectedDate,
        className: selectedClass,
        section: selectedSection
      }).unwrap();

      toast.success("✅ Attendance saved successfully!");
      refetch();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(`❌ ${err?.data?.message || "Failed to save attendance"}`);
    }
  };

  // Toggle individual attendance with edit modal - FIXED VERSION
  const handleEditClick = (attendanceRecord, student) => {
    // Make sure we're using the correct attendance record ID
    if (!attendanceRecord || !attendanceRecord._id) {
      toast.error("❌ Invalid attendance record");
      return;
    }

    setEditData({
      id: attendanceRecord._id, // Use the attendance record ID, not student ID
      currentStatus: attendanceRecord.status,
      newStatus: attendanceRecord.status, // Initially set to current status
      studentName: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      section: student.section,
      reason: attendanceRecord.reason || "",
      notes: attendanceRecord.notes || ""
    });
    setShowEditModal(true);
  };

  // Handle status change in edit modal
  const handleStatusChange = (newStatus) => {
    setEditData(prev => ({
      ...prev,
      newStatus: newStatus,
      // Clear reason and notes if changing to Present
      ...(newStatus === "Present" && { reason: "", notes: "" })
    }));
  };

  // Save edited attendance - FIXED VERSION
  const handleEditSave = async () => {
    try {
      // Check if status has changed
      if (editData.newStatus === editData.currentStatus) {
        toast.info(`🎉 ${editData.studentName} is already marked as ${editData.currentStatus}! No changes needed.`);
        setShowEditModal(false);
        return;
      }

      // Prepare update data - CORRECTED: attendanceId is passed separately
      const updateData = {
        attendanceId: editData.id, // This will be used in URL
        status: editData.newStatus,
        reason: editData.reason || "",
        notes: editData.notes || ""
      };

      console.log("Sending update data:", updateData); // For debugging

      // Call the toggle attendance mutation
      await toggleAttendance(updateData).unwrap();
      
      toast.success(`✅ ${editData.studentName}'s attendance updated to ${editData.newStatus} successfully!`);
      setShowEditModal(false);
      refetch(); // Refresh the data
    } catch (err) {
      console.error("Edit error:", err);
      toast.error(`❌ ${err?.data?.message || "Failed to update attendance"}`);
    }
  };

  // Generate PDF Report
  const handleGeneratePDF = async () => {
    if (!selectedStudent) return;

    try {
      const blob = await generatePDF({ 
        studentId: selectedStudent._id,
        month: pdfPeriod.month,
        year: pdfPeriod.year
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedStudent.name}-attendance-report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("✅ PDF generated successfully!");
      setShowPDFModal(false);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error(`❌ Failed to generate PDF: ${err?.data?.message || err.message}`);
    }
  };

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <ToastContainer position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <FaSchool className="text-4xl text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Student Attendance System
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Manage daily attendance with detailed tracking and reporting</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
              }}
              className="border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              disabled={!selectedClass}
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-2 border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />

            <button
              onClick={saveAttendance}
              disabled={!selectedClass || !selectedSection}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              💾 Save Attendance
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedClass && selectedSection && (
            <div className="flex flex-col md:flex-row gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border-2 border-gray-300 p-3 rounded-xl flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Bulk Action...</option>
                <option value="Present">Mark All Present</option>
                <option value="Absent">Mark All Absent</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Apply to All
              </button>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        {attendanceData?.summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow text-center border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-gray-800">{attendanceData.summary.totalStudents}</div>
              <div className="text-gray-600 font-semibold">Total Students</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow text-center border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">{attendanceData.summary.present}</div>
              <div className="text-gray-600 font-semibold">Present</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow text-center border-l-4 border-red-500">
              <div className="text-3xl font-bold text-red-600">{attendanceData.summary.absent}</div>
              <div className="text-gray-600 font-semibold">Absent</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow text-center border-l-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">{attendanceData.summary.notMarked}</div>
              <div className="text-gray-600 font-semibold">Not Marked</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow text-center border-l-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-600">{attendanceData.summary.attendancePercentage}%</div>
              <div className="text-gray-600 font-semibold">Attendance %</div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass && selectedSection && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">Roll No</th>
                    <th className="p-4 text-left font-semibold">Student Name</th>
                    <th className="p-4 text-left font-semibold">Parent</th>
                    <th className="p-4 text-left font-semibold">Contact</th>
                    <th className="p-4 text-center font-semibold">Status</th>
                    <th className="p-4 text-center font-semibold">Reason (if absent)</th>
                    <th className="p-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const currentStatus = attendanceStatus[student._id];
                    const currentReason = attendanceReasons[student._id] || "";
                    const currentNotes = attendanceNotes[student._id] || "";
                    const existingAttendance = attendanceData?.data?.find(
                      item => item.student._id === student._id
                    )?.attendance;

                    return (
                      <tr key={student._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-semibold text-gray-900">{student.rollNumber}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600 text-sm" />
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-700">{student.parentName}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-500" />
                            <span className="font-mono">{student.contactNumber}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAttendanceChange(student._id, "Present")}
                              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                                currentStatus === "Present" 
                                  ? "bg-green-600 text-white shadow-lg" 
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(student._id, "Absent")}
                              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                                currentStatus === "Absent" 
                                  ? "bg-red-600 text-white shadow-lg" 
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                          {existingAttendance && (
                            <div className="text-xs text-gray-500 mt-2 text-center">
                              Marked by: {existingAttendance.markedBy?.name}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {currentStatus === "Absent" && (
                            <div className="space-y-2">
                              <select
                                value={currentReason}
                                onChange={(e) => handleReasonChange(student._id, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="">Select Reason</option>
                                <option value="Sick">Sick</option>
                                <option value="Family Function">Family Function</option>
                                <option value="Personal Work">Personal Work</option>
                                <option value="Weather Conditions">Weather Conditions</option>
                                <option value="Transport Issue">Transport Issue</option>
                                <option value="Other">Other</option>
                              </select>
                              {currentReason === "Other" && (
                                <input
                                  type="text"
                                  placeholder="Specify reason..."
                                  value={currentNotes}
                                  onChange={(e) => handleNotesChange(student._id, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            {existingAttendance && (
                              <button 
                                onClick={() => handleEditClick(existingAttendance, student)}
                                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 flex items-center gap-2 transition-colors"
                              >
                                <FaEdit size={14} /> Edit
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowHistoryModal(true);
                              }}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors"
                            >
                              <FaHistory size={14} /> History
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2 transition-colors"
                              >
                              <FaIdCard size={14} /> Details
                            </button>
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

        {/* Empty State */}
        {selectedClass && selectedSection && filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
            <p className="text-gray-500">There are no students in {selectedClass}-{selectedSection}</p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div 
            ref={studentModalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 relative transform animate-scale-in"
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowStudentModal(false)}
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Student Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-900 font-medium">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-700">Roll No:</span>
                <span className="text-gray-900 font-mono">{selectedStudent.rollNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-700">Class:</span>
                <span className="text-gray-900">{selectedStudent.className} - {selectedStudent.section}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-700">Parent:</span>
                <span className="text-gray-900">{selectedStudent.parentName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-700">Contact:</span>
                <span className="text-gray-900 font-mono">{selectedStudent.contactNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-semibold text-gray-700">Gender:</span>
                <span className="text-gray-900 capitalize">{selectedStudent.gender}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-semibold text-gray-700">Address:</span>
                <span className="text-gray-900 text-right max-w-xs">{selectedStudent.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Attendance Modal */}
      {showEditModal && (
       <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <div 
      ref={editModalRef}
      className="bg-white rounded-2xl w-full max-w-sm mx-auto p-4 relative transform animate-scale-in shadow-2xl border border-gray-200"
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Edit Attendance</h2>
        <button 
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          onClick={() => setShowEditModal(false)}
        >
          <FaTimes size={16} />
        </button>
      </div>
      
      {/* Student Info - Compact */}
      <div className="mb-4 text-center">
        <p className="font-semibold text-gray-900 text-sm">{editData.studentName}</p>
        <p className="text-xs text-gray-600">
          Roll No: {editData.rollNumber} • {editData.className}-{editData.section}
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Current Status - Compact */}
        <div className="text-center">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Current Status</label>
          <div className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm ${
            editData.currentStatus === "Present" 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {editData.currentStatus === "Present" ? (
              <FaCheck className="mr-1 text-green-600" size={12} />
            ) : (
              <FaTimesCircle className="mr-1 text-red-600" size={12} />
            )}
            {editData.currentStatus}
          </div>
        </div>

        {/* Status Selection Buttons - Compact */}
        <div className="text-center">
          <label className="block text-xs font-semibold text-gray-700 mb-3">Select New Status</label>
          <div className="flex justify-center space-x-3">
            {/* Present Button */}
            <button
              onClick={() => handleStatusChange("Present")}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                editData.newStatus === "Present"
                  ? "bg-green-500 border-green-600 text-white shadow-lg"
                  : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 hover:border-green-400"
              }`}
            >
              <FaCheck className={`text-xl mb-1 ${editData.newStatus === "Present" ? "text-white" : "text-green-600"}`} />
              <span className="font-bold text-xs">Present</span>
              {editData.newStatus === "Present" && (
                <div className="mt-1 text-xs bg-white text-green-600 px-1 py-0.5 rounded-full font-semibold">
                  ✓
                </div>
              )}
            </button>

            {/* Absent Button */}
            <button
              onClick={() => handleStatusChange("Absent")}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                editData.newStatus === "Absent"
                  ? "bg-red-500 border-red-600 text-white shadow-lg"
                  : "bg-red-100 border-red-300 text-red-700 hover:bg-red-200 hover:border-red-400"
              }`}
            >
              <FaTimesCircle className={`text-xl mb-1 ${editData.newStatus === "Absent" ? "text-white" : "text-red-600"}`} />
              <span className="font-bold text-xs">Absent</span>
              {editData.newStatus === "Absent" && (
                <div className="mt-1 text-xs bg-white text-red-600 px-1 py-0.5 rounded-full font-semibold">
                  ✓
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Reason Input for Absent Status - Compact */}
        {editData.newStatus === "Absent" && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Absence Reason</label>
            <select
              value={editData.reason || ""}
              onChange={(e) => setEditData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Reason</option>
              <option value="Sick">Sick</option>
              <option value="Family Function">Family Function</option>
              <option value="Personal Work">Personal Work</option>
              <option value="Weather Conditions">Weather Conditions</option>
              <option value="Transport Issue">Transport Issue</option>
              <option value="Other">Other</option>
            </select>
            
            {editData.reason === "Other" && (
              <input
                type="text"
                placeholder="Specify reason..."
                value={editData.notes || ""}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        )}

        {/* Status Change Indicator - Compact */}
        {editData.newStatus !== editData.currentStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs font-semibold">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                {editData.currentStatus}
              </span>
              <span className="text-blue-600 text-xs">→</span>
              <span className={`px-2 py-1 rounded ${
                editData.newStatus === "Present" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {editData.newStatus}
              </span>
            </div>
            <p className="text-blue-700 text-xs mt-1">
              Status will be updated
            </p>
          </div>
        )}

        {/* No Change Message - Compact */}
        {editData.newStatus === editData.currentStatus && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-gray-600 text-xs font-semibold">
              {editData.currentStatus === "Present" 
                ? `🎉 Already Present` 
                : `ℹ️ Already Absent`}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Select different status to update
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setShowEditModal(false)}
          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleEditSave}
          disabled={editData.newStatus === editData.currentStatus}
          className={`flex-1 px-3 py-2 font-semibold rounded-lg transition-all duration-200 text-sm ${
            editData.newStatus !== editData.currentStatus
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {editData.newStatus !== editData.currentStatus 
            ? "💾 Update" 
            : "No Changes"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Attendance History Modal */}
      {showHistoryModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div 
            ref={historyModalRef}
            className="bg-white rounded-2xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto transform animate-scale-in"
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg z-10"
              onClick={() => setShowHistoryModal(false)}
            >
              <FaTimes size={20} />
            </button>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedStudent.name}'s Attendance History
                </h2>
                <p className="text-gray-600">
                  Roll No: {selectedStudent.rollNumber} | Class: {selectedStudent.className}-{selectedStudent.section}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPDFModal(true);
                }}
                className="px-4 py-2 mr-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaFilePdf /> Generate PDF
              </button>
            </div>

            {/* History Summary */}
            {historyData?.data?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{historyData.data.summary.totalDays}</div>
                  <div className="text-blue-600 text-sm font-semibold">Total Days</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{historyData.data.summary.presentDays}</div>
                  <div className="text-green-600 text-sm font-semibold">Present</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{historyData.data.summary.absentDays}</div>
                  <div className="text-red-600 text-sm font-semibold">Absent</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{historyData.data.summary.attendancePercentage}%</div>
                  <div className="text-purple-600 text-sm font-semibold">Percentage</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">
                    {historyData.data.summary.totalDays > 0 
                      ? Math.round(historyData.data.summary.presentDays / historyData.data.summary.totalDays * 100)
                      : 0}%
                  </div>
                  <div className="text-orange-600 text-sm font-semibold">Overall</div>
                </div>
              </div>
            )}

            {/* Reason Statistics */}
            {historyData?.data?.summary?.reasonStats && Object.keys(historyData.data.summary.reasonStats).length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Absence Reason Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(historyData.data.summary.reasonStats).map(([reason, count]) => (
                    <div key={reason} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{reason}</span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-semibold">
                          {count} {count === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Table */}
            {historyData?.data?.history?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Day</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Reason</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Session</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.data.history.map((record) => (
                      <tr key={record._id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === "Present" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 max-w-xs">
                          {record.reason || record.notes || '-'}
                        </td>
                        <td className="p-3 text-gray-600">{record.session}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-500" />
                            {record.teacherId?.name || 'System'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FaCalendar className="text-5xl text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-700 mb-2">No Attendance History</h4>
                <p className="text-gray-500">No attendance records found for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Generation Modal */}
      {showPDFModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div 
            ref={pdfModalRef}
            className="bg-white rounded-2xl w-full max-w-md p-6 relative transform animate-scale-in"
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowPDFModal(false)}
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate PDF Report</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Report Period</label>
                <div className="space-y-3">
                  <select
                    value={pdfPeriod.type}
                    onChange={(e) => setPdfPeriod(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="month">Monthly Report</option>
                    <option value="custom">Custom Period</option>
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={pdfPeriod.month}
                      onChange={(e) => setPdfPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                      className="p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>

                    <select
                      value={pdfPeriod.year}
                      onChange={(e) => setPdfPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Report Preview</h4>
                <p className="text-blue-700 text-sm">
                  This will generate a detailed PDF report for {selectedStudent.name} covering {
                    pdfPeriod.type === 'month' 
                      ? `${new Date(2000, pdfPeriod.month - 1).toLocaleString('default', { month: 'long' })} ${pdfPeriod.year}`
                      : 'the selected period'
                  }. The report will include attendance summary, detailed records, and absence analysis.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPDFModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePDF}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaDownload /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsAttendance;