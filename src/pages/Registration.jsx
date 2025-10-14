import React, { useState } from "react";
import { useRegisterTeacherMutation } from "../redux/apis/authApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();
  const [registerTeacher, { isLoading }] = useRegisterTeacherMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    qualification: "",
    subjects: "",
    salaryType: "fixed",
    baseSalary: "",
    documents: null,
  });

  const [errors, setErrors] = useState({});

  // Enhanced Form Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile must be 10 digits";
    
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.subjects.trim()) newErrors.subjects = "Subjects are required";
    if (!formData.baseSalary || formData.baseSalary <= 0) newErrors.baseSalary = "Valid base salary is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "documents") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === "mobile") {
      // Only allow numbers for mobile
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue.slice(0, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("❌ Please fix all errors before submitting!");
      return;
    }

    try {
      const data = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "subjects" && typeof value === "string") {
          // Convert subjects string to array
          const subjectsArray = value.split(',').map(subject => subject.trim()).filter(subject => subject);
          data.append(key, JSON.stringify(subjectsArray));
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      const res = await registerTeacher(data).unwrap();
      
      if (res.message) {
        toast.success("✅ Registration request submitted! Awaiting admin approval.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err?.data?.message || "Registration failed! Please try again.";
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const inputClass = (fieldName) => 
    `w-full p-4 border rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition duration-200 ${
      errors[fieldName] ? "border-red-400" : "border-gray-200"
    }`;

  const buttonClass = 
    `w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
      isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
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
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-2xl border border-gray-100">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Teacher Registration
          </h2>
          <p className="text-gray-600 text-lg">
            Join our teaching community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Mobile & Qualification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
                className={inputClass("mobile")}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.mobile}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                placeholder="Your highest qualification"
                value={formData.qualification}
                onChange={handleChange}
                className={inputClass("qualification")}
              />
              {errors.qualification && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.qualification}
                </p>
              )}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects *
            </label>
            <input
              type="text"
              name="subjects"
              placeholder="Mathematics, Physics, Chemistry"
              value={formData.subjects}
              onChange={handleChange}
              className={inputClass("subjects")}
            />
            {errors.subjects && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.subjects}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              💡 Separate multiple subjects with commas
            </p>
          </div>

          {/* Salary Type & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Type
              </label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition duration-200"
              >
                <option value="fixed">Fixed Salary</option>
                <option value="per_class">Per Class</option>
                <option value="per_hour">Per Hour</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base {formData.salaryType === "fixed" ? "Salary" : formData.salaryType === "per_class" ? "Rate per Class" : "Rate per Hour"} *
              </label>
              <input
                type="number"
                name="baseSalary"
                placeholder={`Enter ${formData.salaryType === "fixed" ? "salary" : "rate"}`}
                value={formData.baseSalary}
                onChange={handleChange}
                min="0"
                className={inputClass("baseSalary")}
              />
              {errors.baseSalary && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.baseSalary}
                </p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents
            </label>
            <input
              type="file"
              name="documents"
              onChange={handleChange}
              className="w-full p-4 border border-gray-200 rounded-xl bg-white text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-gray-500 text-sm mt-2">
              📎 Upload qualifications, certificates, or ID proof (PDF, JPG, PNG, DOC)
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={buttonClass}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Registration...
              </div>
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Already registered?{" "}
            <Link 
              to="/login" 
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition duration-200"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;