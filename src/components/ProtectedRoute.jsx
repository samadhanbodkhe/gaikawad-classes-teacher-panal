import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useVerifyTeacherTokenQuery, useLogoutTeacherMutation } from "../redux/apis/authApi";
import { useDispatch } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const { data, error, isLoading } = useVerifyTeacherTokenQuery();

  const [logoutTeacher] = useLogoutTeacherMutation();

  useEffect(() => {
    if (error) {
      // agar token invalid ya expire ho gaya
      logoutTeacher(); // backend logout
      localStorage.removeItem("token");
      localStorage.removeItem("teacher");
    }
  }, [error, logoutTeacher, dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Checking Authorization...
      </div>
    );
  }

  // ❌ agar token invalid ya teacher delete hua
  if (error) {
    return <Navigate to="/login" replace />;
  }

  // ✅ agar valid hai to andar ja
  if (data?.success) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
