import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

// ✅ Enhanced authentication check
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const teacher = localStorage.getItem("teacher");
  
  if (!token || !teacher) return false;
  
  try {
    const teacherData = JSON.parse(teacher);
    return !!(teacherData && teacherData.isActive && teacherData.isApproved);
  } catch {
    return false;
  }
};

// ✅ Public route: only shown if NOT logged in
const PublicRoute = ({ element }) => {
  return !isAuthenticated() ? element : <Navigate to="/profile" replace />;
};

// ✅ Private route: only shown if logged in
const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* -------- PUBLIC ROUTES -------- */}
      <Route path="/" element={<PublicRoute element={<Registration />} />} />
      <Route path="/login" element={<PublicRoute element={<Login01 />} />} />
      <Route path="/verify-otp" element={<PublicRoute element={<VerifyOtp />} />} />

      {/* -------- PRIVATE ROUTES -------- */}
      <Route path="/" element={<PrivateRoute element={<AdminLayout />} />}>
        <Route path="profile" element={<Profile />} />
        <Route path="leaverequest" element={<Leaverequest />} />
        <Route path="salarystatus" element={<Salary/>} />
        <Route path="leavestatus" element={<LeaveStatus/>} />
        <Route path="schedule" element={<Schedule/>} />
        <Route path="attendance" element={<Attendance/>} />
        <Route path="studentattendance" element={<StudentsAttendance/>} />
        <Route path="studentadd" element={<AddStd/>} />
      </Route>

      {/* -------- NOT FOUND -------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;