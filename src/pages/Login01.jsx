import React, { useState } from "react";
import { useLoginTeacherMutation } from "../redux/apis/authApi";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Login01 = () => {
  const [email, setEmail] = useState("");
  const [loginTeacher, { isLoading }] = useLoginTeacherMutation();
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("❌ Please enter your email address!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("❌ Please enter a valid email address!");
      return;
    }

    try {
      const result = await loginTeacher({ email }).unwrap();
      
      if (result.message) {
        toast.success("📧 OTP sent to your email! Please check your inbox.");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } });
        }, 1500);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const inputClass =
    "w-full p-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition duration-200";

  const buttonClass =
    `w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ${
      isLoading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1 hover:scale-105"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-md border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Teacher Login
          </h2>
          <p className="text-gray-600">
            Enter your email to receive OTP
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={sendOtp} className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={buttonClass}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </div>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700">
              Check your email inbox and spam folder for the OTP. The OTP is valid for 10 minutes.
            </p>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/" className="text-blue-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login01;
