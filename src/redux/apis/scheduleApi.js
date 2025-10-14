import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scheduleApi = createApi({
    reducerPath: "scheduleApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/schedule`,
        credentials: "include",
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
