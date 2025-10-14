 import React, { useState, useEffect } from "react";
import { useCreateStudentMutation, useUpdateStudentMutation, useGetStudentByIdQuery, useGetAllStudentsQuery, useDeleteStudentMutation } from "../redux/apis/createStudentApi";

// Add Student Component
const AddStd = ({ studentId, onClose, isEdit, initialData }) => {
  const [createStudent] = useCreateStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  
  // Fetch student data if in edit mode
  const { data: studentResponse } = useGetStudentByIdQuery(studentId, {
    skip: !isEdit || !studentId,
  });

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    className: "",
    section: "",
    admissionDate: "",
    parentName: "",
    contactNumber: "",
    gender: "",
    address: "",
    fees: {
      totalAmount: "",
      paidAmount: "",
      newPayment: ""
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with data
  useEffect(() => {
    if (isEdit) {
      if (studentResponse?.data) {
        const student = studentResponse.data;
        setFormData({
          name: student.name || "",
          rollNumber: student.rollNumber || "",
          className: student.className || "",
          section: student.section || "",
          admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : "",
          parentName: student.parentName || "",
          contactNumber: student.contactNumber || "",
          gender: student.gender || "",
          address: student.address || "",
          fees: {
            totalAmount: student.fees?.totalAmount || "",
            paidAmount: student.fees?.paidAmount || "",
            newPayment: ""
          }
        });
      } else if (initialData) {
        setFormData({
          name: initialData.name || "",
          rollNumber: initialData.rollNumber || "",
          className: initialData.className || "",
          section: initialData.section || "",
          admissionDate: initialData.admissionDate ? new Date(initialData.admissionDate).toISOString().split('T')[0] : "",
          parentName: initialData.parentName || "",
          contactNumber: initialData.contactNumber || "",
          gender: initialData.gender || "",
          address: initialData.address || "",
          fees: {
            totalAmount: initialData.fees?.totalAmount || "",
            paidAmount: initialData.fees?.paidAmount || "",
            newPayment: ""
          }
        });
      }
    } else {
      // Reset form for new student
      setFormData({
        name: "",
        rollNumber: "",
        className: "",
        section: "",
        admissionDate: new Date().toISOString().split('T')[0],
        parentName: "",
        contactNumber: "",
        gender: "",
        address: "",
        fees: {
          totalAmount: "",
          paidAmount: "",
          newPayment: ""
        }
      });
    }
  }, [isEdit, studentResponse, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('fees.')) {
      const feeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        fees: {
          ...prev.fees,
          [feeField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
    if (!formData.className.trim()) newErrors.className = "Class is required";
    if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    
    // Validate contact number
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.contactNumber && !phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid 10-digit phone number";
    }

    // Validate fees
    if (!isEdit) {
      const totalAmount = Number(formData.fees.totalAmount) || 0;
      const paidAmount = Number(formData.fees.paidAmount) || 0;
      
      if (paidAmount > totalAmount) {
        newErrors.fees = "Paid amount cannot be greater than total amount";
      }
    } else {
      const newPayment = Number(formData.fees.newPayment) || 0;
      const totalAmount = Number(formData.fees.totalAmount) || 0;
      const currentPaid = Number(formData.fees.paidAmount) || 0;
      
      if (newPayment + currentPaid > totalAmount) {
        newErrors.fees = "New payment cannot exceed pending amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim(),
        className: formData.className,
        section: formData.section,
        admissionDate: formData.admissionDate,
        parentName: formData.parentName.trim(),
        contactNumber: formData.contactNumber.trim(),
        gender: formData.gender,
        address: formData.address.trim(),
      };

      if (isEdit) {
        // For edit, include fees only if there's a new payment
        if (formData.fees.newPayment && Number(formData.fees.newPayment) > 0) {
          submitData.fees = {
            newPayment: Number(formData.fees.newPayment)
          };
        }
        await updateStudent({ id: studentId, ...submitData }).unwrap();
        alert("Student updated successfully!");
      } else {
        // For create, include initial fee data
        submitData.fees = {
          totalAmount: Number(formData.fees.totalAmount) || 0,
          paidAmount: Number(formData.fees.paidAmount) || 0
        };
        await createStudent(submitData).unwrap();
        alert("Student created successfully!");
      }
      
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      alert(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} student`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const classOptions = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const sectionOptions = ["A", "B", "C", "D", "E"];
  const genderOptions = ["Male", "Female", "Other"];

  const calculatePendingAmount = () => {
    const total = Number(formData.fees.totalAmount) || 0;
    const paid = Number(formData.fees.paidAmount) || 0;
    return total - paid > 0 ? total - paid : 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Student" : "Add New Student"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter student name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number *
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rollNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter roll number"
              disabled={isEdit}
            />
            {errors.rollNumber && <p className="text-red-500 text-sm mt-1">{errors.rollNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            <select
              name="className"
              value={formData.className}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.className ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Class</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {errors.className && <p className="text-red-500 text-sm mt-1">{errors.className}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {sectionOptions.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admission Date
            </label>
            <input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Gender</option>
              {genderOptions.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
        </div>

        {/* Parent Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Name *
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.parentName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter parent name"
              />
              {errors.parentName && <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student address"
          />
        </div>

        {/* Fee Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Information</h3>
          {errors.fees && <p className="text-red-500 text-sm mb-4">{errors.fees}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isEdit ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Fees (₹)
                  </label>
                  <input
                    type="number"
                    name="fees.totalAmount"
                    value={formData.fees.totalAmount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="fees.paidAmount"
                    value={formData.fees.paidAmount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-medium text-gray-700">Pending Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{calculatePendingAmount()}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">Total Fees</p>
                  <p className="text-lg font-bold text-blue-900">₹{formData.fees.totalAmount || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">Paid Amount</p>
                  <p className="text-lg font-bold text-green-900">₹{formData.fees.paidAmount || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Payment (₹)
                  </label>
                  <input
                    type="number"
                    name="fees.newPayment"
                    value={formData.fees.newPayment}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max={Number(formData.fees.totalAmount) - Number(formData.fees.paidAmount)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max: ₹{Number(formData.fees.totalAmount) - Number(formData.fees.paidAmount)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isEdit ? "Update Student" : "Create Student"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Student List Component
const StudentList = () => {
  const { data: studentsResponse, isLoading, error, refetch } = useGetAllStudentsQuery();
  const [deleteStudent] = useDeleteStudentMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [students, setStudents] = useState([]);

  // Update students when data is fetched
  useEffect(() => {
    if (studentsResponse?.data) {
      setStudents(studentsResponse.data);
    }
  }, [studentsResponse]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !classFilter || student.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteStudent(id).unwrap();
        alert("Student deleted successfully!");
        refetch();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete student");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    refetch();
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800 border border-green-200";
      case "Partial": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pending": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentStatusCount = (status) => {
    return students.filter(s => s.fees?.paymentStatus === status).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600 bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-semibold mb-2">Error loading students</p>
          <p className="text-gray-600 mb-4">{error?.data?.message || "Please try again later"}</p>
          <button 
            onClick={refetch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const uniqueClasses = [...new Set(students.map(student => student.className))].sort();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600 mt-2">Manage all students in one place</p>
            </div>
            <button
              onClick={() => {
                setEditingStudent(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Student
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
              <input
                type="text"
                placeholder="Search by name, roll number, or parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setClassFilter("");
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold border border-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fees Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPaymentStatusCount("Paid")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partial Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPaymentStatusCount("Partial")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPaymentStatusCount("Pending")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Roll</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent & Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {students.length === 0 ? "Get started by adding your first student." : "Try adjusting your search or filter."}
                      </p>
                      {students.length === 0 && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Your First Student
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {student.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500 capitalize">{student.gender?.toLowerCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.className}</div>
                        <div className="text-sm text-gray-500">Sec: {student.section || "N/A"}</div>
                        <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.parentName}</div>
                        <div className="text-sm text-gray-500">{student.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(student.fees?.paymentStatus)}`}>
                            {student.fees?.paymentStatus || "Pending"}
                          </span>
                          <div className="text-xs text-gray-500">
                            ₹{student.fees?.paidAmount || 0} / ₹{student.fees?.totalAmount || 0}
                          </div>
                          {student.fees?.pendingAmount > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              Pending: ₹{student.fees?.pendingAmount || 0}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors border border-blue-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student._id, student.name)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors border border-red-200 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <AddStd
              studentId={editingStudent?._id}
              onClose={handleCloseModal}
              isEdit={!!editingStudent}
              initialData={editingStudent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;