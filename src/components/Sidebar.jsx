import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegCalendarCheck, FaUser, FaUserEdit, FaBars, FaTimes, FaMoneyCheckAlt, FaCalendarAlt, FaClipboardList, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useLogoutTeacherMutation } from "../redux/apis/authApi";

const menuItems = [
  { name: "Profile", path: "/profile", icon: <FaUser /> },
  { name: "Leave Status", path: "/leavestatus", icon: <FaClipboardList /> },
  { name: "Salary Status", path: "/salarystatus", icon: <FaMoneyCheckAlt /> },
  { name: "Schedule", path: "/schedule", icon: <FaCalendarAlt /> },
  { name: "Attendance", path: "/attendance", icon: <FaRegCalendarCheck /> },
  { name: "Student Attendance", path: "/studentattendance", icon: <FaRegCalendarCheck /> },
  { name: "Add Student", path: "/studentadd", icon: <FaPlus /> },
];

const bottomItem = { name: "Logout", path: "/login", icon: <FaUserEdit /> };

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [logoutTeacher, { isLoading }] = useLogoutTeacherMutation();

  const handleNavClick = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  const handleLogout = async () => {
    try {
      await logoutTeacher().unwrap(); // Calls API & clears storage
      toast.success("Logged out successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Try again.");
    }
  };

  // Close sidebar on clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        if (isOpen) toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, toggleSidebar]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-md shadow-lg md:hidden"
      >
        <FaBars className="text-lg" />
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed md:relative inset-y-0 left-0 bg-white text-gray-700 h-screen flex flex-col justify-between p-4 transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-64 w-60 shadow-lg`}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={toggleSidebar}
          className="text-2xl mb-5 md:hidden text-gray-400"
        >
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="flex-shrink-0 mb-4">
          <img
            src="https://nexkites-admin-nfr8.vercel.app/assets/Logo-DMb1smQm.webp"
            alt="Logo"
            className="h-8"
          />
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2 pr-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-100 text-blue-600 border-r-4 border-blue-500"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-3 p-3 pl-4 rounded-lg w-full">
                  <span
                    className={`text-lg ${
                      location.pathname === item.path ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Item - Logout */}
        <button
          onClick={handleLogout}
          className={`flex-shrink-0 w-full p-3 mt-4 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors`}
        >
          <div className="bg-blue-100 p-2 rounded-full">
            {bottomItem.icon}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{bottomItem.name}</p>
          </div>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
