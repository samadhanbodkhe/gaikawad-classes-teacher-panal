import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/salary`,
    credentials: "include",
  }),
  tagTypes: ["Salary"],
  endpoints: (builder) => ({
    getTeacherSalary: builder.query({
      query: () => ({
        url: "/teacherSalary",
        method: "GET",
      }),
      providesTags: ["Salary"],
    }),
  }),
});

export const { useGetTeacherSalaryQuery } = salaryApi;
