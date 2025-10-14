import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogoutTeacherMutation } from "../redux/apis/authApi";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [logoutStaff, { isSuccess, isError, error }] = useLogoutTeacherMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const titles = {
    "/profile": "Profile",
    "/registration": "Registration",
    "/Leaverequest": "Leave Request",
    "/": "Dashboard",
    "/TeacherAR": "Dashboard",
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Logout successful!");
      navigate("/registration");
    }
    if (isError) {
      toast.error(error?.data?.message || "Logout failed!");
    }
  }, [isSuccess, isError, error, navigate]);

  const handleLogout = () => {
    logoutStaff();
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-md px-4 py-3 md:px-6 md:py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between relative">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="text-gray-700 text-2xl p-2 rounded-md hover:bg-gray-100 transition md:hidden absolute left-2 top-1/2 -translate-y-1/2"
        >
          <FaBars />
        </button>

        {/* Center Title */}
        <h1 className="text-xl md:text-2xl font-bold text-blue-800 text-center w-full">
          {titles[location.pathname] || "Teacher Panel"}
        </h1>
      </div>
    </header>
  );
};

export default Header;
