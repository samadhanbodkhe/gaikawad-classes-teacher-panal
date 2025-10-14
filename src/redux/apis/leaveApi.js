import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/leaveRequest`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Leave"],
  endpoints: (builder) => ({
    // ✅ Create Leave Request
    createLeave: builder.mutation({
      query: (data) => ({
        url: "/createLeaveRequest",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Leave"],
    }),

    // ✅ Fetch Leave Requests for Logged-in Teacher
    getLeaveRequestsByTeacher: builder.query({
      query: () => ({
        url: "/getLeaveRequestsByTeacher",
        method: "GET",
      }),
      providesTags: ["Leave"],
    }),
  }),
});

export const {
  useCreateLeaveMutation,
  useGetLeaveRequestsByTeacherQuery,
} = leaveApi;
