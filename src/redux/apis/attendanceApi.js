import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/attendance`,
    credentials: "include",
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAttendanceTeachers: builder.query({
      query: () => "/getTeacherAttendance",
      providesTags: ["Attendance"],
      keepUnusedDataFor: 300,
    }),
    // You can add more endpoints here for marking attendance, etc.
  }),
});

export const { 
  useGetAttendanceTeachersQuery,
  // Add other hooks as needed
} = attendanceApi;