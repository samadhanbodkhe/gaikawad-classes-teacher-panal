import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scheduleApi = createApi({
    reducerPath: "scheduleApi",
  baseQuery: fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
}),

    tagTypes: ["Schedule"],
    endpoints: (builder) => ({
        getTeacherSchedule: builder.query({
            query: () => ({
                url: "/getTeacherSchedules",
                method: "GET",
            }),
            providesTags: ["Schedule"],
        }),
    }),
});

export const { useGetTeacherScheduleQuery } = scheduleApi;
