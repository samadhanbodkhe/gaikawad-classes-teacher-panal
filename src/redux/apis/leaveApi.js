import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/leaveRequest`,
    credentials: "include",
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
