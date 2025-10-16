// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  useGetTeacherProfileQuery,
  useUpdateTeacherProfileMutation,
  useLogoutTeacherMutation,
  useDeleteTeacherMutation,
} from "../redux/apis/authApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    error: profileError,
    refetch,
  } = useGetTeacherProfileQuery();

  const [updateTeacherProfile, { isLoading: isUpdating }] =
    useUpdateTeacherProfileMutation();
  const [logoutTeacher] = useLogoutTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    mobile: "",
    qualification: "",
    subjects: "",
    salaryType: "fixed",
    baseSalary: "",
    documents: [],
    profileImageUrl: "",
  });

  // Local state for the update modal fields
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Controlled update form state
  const [updateForm, setUpdateForm] = useState({
    name: "",
    mobile: "",
    qualification: "",
    subjects: "", // comma separated
    salaryType: "fixed",
    baseSalary: "",
    profileImageFile: null,
    documentsFiles: [], // array of File
  });

  // Previews
  const [profilePreview, setProfilePreview] = useState("");
  const [docPreviews, setDocPreviews] = useState([]);

  // Refs to handle overlay clicks / escape
  const updateModalRef = useRef(null);

  // Helper function to parse subjects from various formats
  const parseSubjects = (subjects) => {
    if (!subjects) return "";
    
    // If it's already a string, return it
    if (typeof subjects === 'string') {
      // Check if it's a stringified array
      if (subjects.startsWith('[') || subjects.startsWith('"[')) {
        try {
          // Clean the string and parse
          const cleanedString = subjects.replace(/^"|"$/g, '').replace(/\\"/g, '"');
          const parsed = JSON.parse(cleanedString);
          if (Array.isArray(parsed)) {
            return parsed.join(", ");
          }
          return subjects;
        } catch (error) {
          console.warn('Failed to parse subjects:', error);
          return subjects;
        }
      }
      return subjects;
    }
    
    // If it's an array, join it
    if (Array.isArray(subjects)) {
      return subjects.join(", ");
    }
    
    return String(subjects);
  };

  // Load profileResponse into local state
  useEffect(() => {
    if (profileResponse) {
      const t = profileResponse;
      const parsedSubjects = parseSubjects(t.subjects);
      
      setProfileData({
        name: t.name || "",
        email: t.email || "",
        mobile: t.mobile || "",
        qualification: t.qualification || "",
        subjects: parsedSubjects,
        salaryType: t.salaryType || "fixed",
        baseSalary: t.baseSalary || "",
        documents: t.documents || [],
        profileImageUrl: t.profileImage || "",
      });

      setUpdateForm({
        name: t.name || "",
        mobile: t.mobile || "",
        qualification: t.qualification || "",
        subjects: parsedSubjects,
        salaryType: t.salaryType || "fixed",
        baseSalary: t.baseSalary || "",
        profileImageFile: null,
        documentsFiles: [],
      });

      setProfilePreview(t.profileImage || "");
      setDocPreviews([]);
    }
  }, [profileResponse]);

  // Close modal on ESC
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowUpdateModal(false);
        setShowActionModal(false);
        setShowDeleteModal(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // Helpers for update form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((p) => ({ ...p, [name]: value }));
  };

  // Profile image selection
  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpdateForm((p) => ({ ...p, profileImageFile: file }));
    setProfilePreview(URL.createObjectURL(file));
  };

  // Documents selection (allow multiple)
  const handleDocumentsSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUpdateForm((p) => ({
      ...p,
      documentsFiles: [...p.documentsFiles, ...files],
    }));
    // create small previews (just names)
    setDocPreviews((prev) => [...prev, ...files.map((f) => ({ name: f.name }))]);
  };

  // Remove a selected document before uploading
  const removeSelectedDocument = (index) => {
    setUpdateForm((p) => {
      const copy = [...p.documentsFiles];
      copy.splice(index, 1);
      return { ...p, documentsFiles: copy };
    });
    setDocPreviews((p) => {
      const copy = [...p];
      copy.splice(index, 1);
      return copy;
    });
  };

  // Build FormData and call update API
  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();

      // Basic fields
      if (updateForm.name) formData.append("name", updateForm.name);
      if (updateForm.mobile) formData.append("mobile", updateForm.mobile);
      if (updateForm.qualification)
        formData.append("qualification", updateForm.qualification);

      // Subjects: send as comma-separated string (backend should handle parsing)
      if (updateForm.subjects) {
        const subjectsArray = updateForm.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        // Send as simple string instead of JSON stringified
        formData.append("subjects", subjectsArray.join(", "));
      }

      if (updateForm.salaryType) formData.append("salaryType", updateForm.salaryType);
      if (updateForm.baseSalary) formData.append("baseSalary", updateForm.baseSalary);

      // Profile image (single)
      if (updateForm.profileImageFile) {
        formData.append("profileImage", updateForm.profileImageFile);
      }

      // Documents (multiple)
      if (updateForm.documentsFiles && updateForm.documentsFiles.length > 0) {
        updateForm.documentsFiles.forEach((file) => {
          formData.append("documents", file);
        });
      }

      // Trigger update
      const result = await updateTeacherProfile(formData).unwrap();

      if (result?.message) {
        toast.success("Profile updated successfully");
        setShowUpdateModal(false);
        // refetch latest profile
        refetch();
        // Reset local selected files
        setUpdateForm((p) => ({ ...p, profileImageFile: null, documentsFiles: [] }));
      } else {
        toast.success("Profile updated");
        refetch();
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err?.data?.message || err?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logoutTeacher().unwrap();
      toast.success("Logged out");
      // clear local storage if needed and redirect
      localStorage.removeItem("teacher");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
      toast.error("Logout failed");
    }
  };

  // Delete account
  const confirmAndDelete = async () => {
    try {
      await deleteTeacher().unwrap();
      toast.success("Account deleted");
      localStorage.removeItem("teacher");
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error("Delete error", err);
      toast.error(err?.data?.message || "Failed to delete account");
    }
  };

  // Modal overlay click handler: close when clicking overlay, ignore clicks inside modal
  const onOverlayClick = (e, closeFn) => {
    if (e.target === e.currentTarget) {
      closeFn(false);
    }
  };

  // Get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    try {
      return url.split('/').pop() || "Document";
    } catch {
      return "Document";
    }
  };

  // Basic info loading or error UI
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 bg-slate-200 rounded-full" />
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Failed to load profile</h3>
          <p className="text-sm text-slate-600 mb-4">Try refreshing the page.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-slate-900 text-white rounded">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // UI classes
  const inputClass =
    "w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300";
  const buttonClass = "px-4 py-2 rounded-lg font-medium";

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Teacher Profile</h1>
          <p className="text-slate-600">Manage your account & personal details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="relative inline-block mb-3">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                    {profilePreview ? (
                      <img src={profilePreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{(profileData.name || "T").charAt(0)}</span>
                    )}
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-slate-900">{profileData.name}</h2>
                <p className="text-slate-600 text-sm">{profileData.qualification}</p>
                <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mt-2">
                  Active
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className={`${buttonClass} w-full bg-slate-900 text-white hover:bg-slate-800`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowActionModal(true)}
                  className={`${buttonClass} w-full border border-slate-300 text-slate-700 hover:bg-slate-50`}
                >
                  Account Settings
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-600">Full Name</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                    {profileData.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Email</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">{profileData.email}</div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600">Mobile</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">{profileData.mobile}</div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Qualification</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                    {profileData.qualification}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-600">Subjects</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                    {profileData.subjects || "No subjects assigned"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600">Salary</label>
                  <div className="mt-1 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-2xl font-bold">₹{profileData.baseSalary}</div>
                    <div className="text-sm text-slate-600 capitalize">{profileData.salaryType}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Documents</h3>
              {profileData.documents && profileData.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.documents.map((documentUrl, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {getFileNameFromUrl(documentUrl).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Doc {index + 1}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="font-medium text-slate-900 text-sm truncate">
                          {getFileNameFromUrl(documentUrl)}
                        </div>
                      </div>
                      <a 
                        href={documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <div className="text-slate-400 mb-2">No documents uploaded</div>
                  <div className="text-sm text-slate-500">Upload documents to see them here</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => onOverlayClick(e, setShowUpdateModal)}
        >
          <div
            ref={updateModalRef}
            className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Update Profile</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-500 hover:text-slate-700">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Profile image uploader */}
              <div className="text-center">
                <div className="inline-block relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 mx-auto flex items-center justify-center">
                    {profilePreview ? (
                      <img src={profilePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">{(updateForm.name || "T").charAt(0)}</span>
                    )}
                  </div>

                  <label className="mt-2 inline-block cursor-pointer text-xs text-slate-600">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                    />
                    Change Profile Image
                  </label>
                </div>
              </div>

              {/* Form grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Full name</label>
                  <input className={inputClass} name="name" value={updateForm.name} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Mobile</label>
                  <input className={inputClass} name="mobile" value={updateForm.mobile} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Qualification</label>
                  <input className={inputClass} name="qualification" value={updateForm.qualification} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Subjects</label>
                  <input
                    className={inputClass}
                    name="subjects"
                    value={updateForm.subjects}
                    onChange={handleChange}
                    placeholder="Math, Physics, Chemistry"
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter subjects separated by commas</p>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Salary Type</label>
                  <select
                    className={inputClass}
                    name="salaryType"
                    value={updateForm.salaryType}
                    onChange={handleChange}
                  >
                    <option value="fixed">Fixed (monthly)</option>
                    <option value="hourly">Hourly</option>
                    <option value="per_class">Per class</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">Base Salary</label>
                  <input className={inputClass} name="baseSalary" value={updateForm.baseSalary} onChange={handleChange} />
                </div>

                {/* Documents upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-1">Upload Documents</label>

                  <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center relative">
                    <div className="text-sm text-slate-600 mb-2">Click to add files (pdf, jpg, png, docx)</div>
                    <div className="text-xs text-slate-500">Maximum file size: 5MB each</div>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple
                      onChange={handleDocumentsSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Selected docs list */}
                  {docPreviews.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-slate-700">Selected files:</div>
                      {docPreviews.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">DOC</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{doc.name}</div>
                              <div className="text-xs text-slate-500">
                                {(doc.size / (1024 * 1024)).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeSelectedDocument(index)} 
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setShowUpdateModal(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                onClick={handleProfileUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {showActionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => onOverlayClick(e, setShowActionModal)}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-semibold">Account Settings</h3>
              <button className="text-slate-500" onClick={() => setShowActionModal(false)}>
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3">
              <button
                className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => {
                  handleLogout();
                  setShowActionModal(false);
                }}
              >
                Logout
              </button>

              <button
                className="w-full text-left p-3 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => {
                  setShowActionModal(false);
                  setShowDeleteModal(true);
                }}
              >
                Delete Account
              </button>
            </div>

            <div className="p-5 border-t">
              <button 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors" 
                onClick={() => setShowActionModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => onOverlayClick(e, setShowDeleteModal)}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
              <p className="text-sm text-slate-600 mb-4">
                This action cannot be undone. All your data will be permanently removed.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={confirmAndDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;