import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/teacherAuth`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Auth", "Profile"],
  endpoints: (builder) => ({

    // 🟢 Register Teacher
    registerTeacher: builder.mutation({
      query: (userData) => ({
        url: "/register-teacher",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),

    // 🟢 Login Teacher
    loginTeacher: builder.mutation({
      query: (userData) => ({
        url: "/login-teacher",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),

    // 🟢 Verify OTP
    verifyTeacher: builder.mutation({
      query: (otpData) => ({
        url: "/verify-otp-teacher",
        method: "POST",
        body: otpData,
      }),
      invalidatesTags: ["Auth"],
      transformResponse: (response) => {
        if (response?.teacher && response?.token) {
          localStorage.setItem("teacher", JSON.stringify(response.teacher));
          localStorage.setItem("token", response.token);
        }
        return response;
      },
    }),

    // 🟢 Logout
    logoutTeacher: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
      transformResponse: (response) => {
        localStorage.removeItem("teacher");
        localStorage.removeItem("token");
        return response;
      },
    }),

    // 🟢 Get Teacher Profile
    getTeacherProfile: builder.query({
      query: () => ({
        url: "/get-profile-teacher",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    // 🟢 Update Teacher Profile
    updateTeacherProfile: builder.mutation({
      query: (formData) => ({
        url: "/update-profile-teacher",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Profile"],
    }),

    // 🟢 Delete Teacher Account
    deleteTeacher: builder.mutation({
      query: () => ({
        url: "/delete-teacher",
        method: "DELETE",
      }),
      invalidatesTags: ["Auth"],
      transformResponse: (response) => {
        localStorage.removeItem("teacher");
        localStorage.removeItem("token");
        return response;
      },
    }),

    // 🟢 Verify Token (for ProtectedRoute)
    verifyTeacherToken: builder.query({
      query: () => ({
        url: "/verifyToken",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterTeacherMutation,
  useLoginTeacherMutation,
  useVerifyTeacherMutation,
  useLogoutTeacherMutation,
  useGetTeacherProfileQuery,
  useUpdateTeacherProfileMutation,
  useDeleteTeacherMutation,
  useVerifyTeacherTokenQuery, // 👈 add this
} = authApi;
