import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Registration from "../pages/Registration";
import Login01 from "../pages/Login01";
import Profile from "../pages/Profile";
import Leaverequest from "../pages/Leaverequest";
import NotFound from "../components/NotFound";
import VerifyOtp from "../pages/VerifyOtp";
import Salary from "../pages/Salary";
import LeaveStatus from "../pages/Leavestatus";
import Schedule from "../pages/Shedule";
import Attendance from "../pages/Attendance";
import StudentsAttendance from "../pages/Studentsattendace";
import AddStd from "../pages/AddStd";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* -------- PUBLIC ROUTES -------- */}
      <Route path="/" element={<Registration />} />
      <Route path="/login" element={<Login01 />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* -------- PRIVATE ROUTES -------- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<Profile />} />
        <Route path="leaverequest" element={<Leaverequest />} />
        <Route path="salarystatus" element={<Salary />} />
        <Route path="leavestatus" element={<LeaveStatus />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="studentattendance" element={<StudentsAttendance />} />
        <Route path="studentadd" element={<AddStd />} />
      </Route>

      {/* -------- NOT FOUND -------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
