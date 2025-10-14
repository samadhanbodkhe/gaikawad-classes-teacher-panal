// redux/apis/studentAttendanceApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentAttendanceApi = createApi({
  reducerPath: "studentAttendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/attendanceStudent`,
    credentials: "include"
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    markAttendance: builder.mutation({
      query: (attendanceData) => ({
        url: "/mark-attendance",
        method: "POST",
        body: attendanceData,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // FIXED: Correctly handle attendanceId as URL parameter
    toggleAttendance: builder.mutation({
      query: (data) => {
        const { attendanceId, ...bodyData } = data;
        return {
          url: `/toggle-attendance/${attendanceId}`,
          method: "PUT",
          body: bodyData,
        };
      },
      invalidatesTags: ["Attendance"],
    }),

    getClassAttendance: builder.query({
      query: ({ className, section, date }) => ({
        url: `/class-attendance/${className}/${section}/${date}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    getStudentHistory: builder.query({
      query: ({ studentId, startDate, endDate, month, year }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (month) params.append('month', month);
        if (year) params.append('year', year);
        
        return {
          url: `/student-history/${studentId}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Attendance"],
    }),

    generateAttendancePDF: builder.mutation({
      query: ({ studentId, ...params }) => {
        const queryParams = new URLSearchParams(params);
        return {
          url: `/generate-pdf/${studentId}?${queryParams.toString()}`,
          method: "GET",
          responseHandler: async (response) => {
            if (!response.ok) {
              const error = await response.json();
              throw error;
            }
            return response.blob();
          },
          cache: "no-cache",
        };
      },
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useToggleAttendanceMutation,
  useGetClassAttendanceQuery,
  useGetStudentHistoryQuery,
  useGenerateAttendancePDFMutation,
} = studentAttendanceApi;