import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyTeacherMutation } from "../redux/apis/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaClock } from "react-icons/fa";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifyTeacher, { isLoading }] = useVerifyTeacherMutation();
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const inputsRef = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 3 && value) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasteData.length === 4) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputsRef.current[3].focus();
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 4) {
      toast.error("❌ Please enter all 4 digits of the OTP!");
      return;
    }

    if (timeLeft <= 0) {
      toast.error("❌ OTP has expired! Please request a new one.");
      return;
    }

    try {
      const result = await verifyTeacher({ otp: otpCode }).unwrap();
      
      if (result.message === "Login successful") {
        toast.success("✅ OTP verified successfully! Redirecting...");
        setVerified(true);
        
        // Store teacher data in localStorage
        if (result.teacher) {
          localStorage.setItem("teacher", JSON.stringify(result.teacher));
        }
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage = err?.data?.message || "Invalid OTP! Please try again.";
      toast.error(`❌ ${errorMessage}`);
      
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      inputsRef.current[0].focus();
    }
  };

  const resendOtp = () => {
    toast.info("📧 Resending OTP...");
    // Implement resend OTP logic here
    setTimeLeft(600);
    setOtp(["", "", "", ""]);
    inputsRef.current[0].focus();
  };

  const inputClass = (index) =>
    `w-16 h-16 text-center text-2xl font-bold text-gray-800 rounded-xl border-2 transition-all duration-200 ${
      otp[index] 
        ? "border-green-400 bg-green-50 ring-2 ring-green-200" 
        : "border-gray-300 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
    }`;

  const buttonClass =
    `w-full py-4 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ${
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
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-md border border-gray-100 text-center">
        {!verified ? (
          <>
            {/* Header */}
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Verify OTP
            </h2>
            
            <p className="text-gray-600 mb-2">
              Enter the 4-digit code sent to
            </p>
            <p className="text-blue-600 font-semibold mb-6 break-all">
              {email}
            </p>

            {/* Timer */}
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                <FaClock className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-red-600 font-semibold text-sm">
                  Expires in: {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* OTP Inputs */}
            <form onSubmit={verifyOtp} className="mb-6">
              <div className="flex justify-center gap-4 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className={inputClass(index)}
                    disabled={isLoading || timeLeft <= 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || timeLeft <= 0}
                className={buttonClass}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                onClick={resendOtp}
                disabled={timeLeft > 0}
                className={`text-blue-600 font-semibold hover:text-blue-700 transition duration-200 ${
                  timeLeft > 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-12">
            <FaCheckCircle className="text-green-500 text-6xl mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              OTP Verified Successfully!
            </h3>
            <p className="text-gray-600">
              Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;