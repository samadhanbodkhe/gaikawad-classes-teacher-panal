import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/salary`,
    credentials: "include",
      prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
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
