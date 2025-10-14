import React, { useState } from "react";

const TeacherAR = () => {
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Amit Sharma", subject: "Mathematics", experience: "8 yrs", status: "Pending" },
    { id: 2, name: "Priya Desai", subject: "Science", experience: "5 yrs", status: "Pending" },
    { id: 3, name: "Rahul Joshi", subject: "English", experience: "6 yrs", status: "Pending" },
    { id: 4, name: "Neha Verma", subject: "Computer Science", experience: "4 yrs", status: "Pending" },
    { id: 5, name: "Karan Patel", subject: "History", experience: "7 yrs", status: "Pending" },
  ]);

  // Approve handler
  const handleApprove = (id) => {
    setTeachers(
      teachers.map((teacher) =>
        teacher.id === id ? { ...teacher, status: "Approved" } : teacher
      )
    );
  };

  // Reject handler
  const handleReject = (id) => {
    setTeachers(
      teachers.map((teacher) =>
        teacher.id === id ? { ...teacher, status: "Rejected" } : teacher
      )
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Heading */}
      <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">
        Teacher Approve / Reject
      </h1>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-gray-700">#</th>
              <th className="p-3 text-gray-700">Name</th>
              <th className="p-3 text-gray-700">Subject</th>
              <th className="p-3 text-gray-700">Experience</th>
              <th className="p-3 text-gray-700">Status</th>
              <th className="p-3 text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, index) => (
              <tr
                key={teacher.id}
                className="border-b last:border-none hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium text-gray-800">{teacher.name}</td>
                <td className="p-3 text-gray-600">{teacher.subject}</td>
                <td className="p-3 text-gray-600">{teacher.experience}</td>
                <td
                  className={`p-3 font-semibold ${
                    teacher.status === "Approved"
                      ? "text-green-600"
                      : teacher.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-600"
                  }`}
                >
                  {teacher.status}
                </td>
                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => handleApprove(teacher.id)}
                    disabled={teacher.status === "Approved"}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition ${
                      teacher.status === "Approved"
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(teacher.id)}
                    disabled={teacher.status === "Rejected"}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition ${
                      teacher.status === "Rejected"
                        ? "bg-red-100 text-red-600 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAR;
