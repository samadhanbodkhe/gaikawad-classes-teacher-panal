import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/teacherAuth`,
        credentials: "include"
    }),
    tagTypes: ["auth","Profile"],
    endpoints: (builder) => ({
        registerTeacher: builder.mutation({
            query: (userData) => ({
                url: "/register-teacher",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["auth"],
        }),
        loginTeacher: builder.mutation({
            query: (userData) => ({
                url: "/login-teacher",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["auth"],
        }),

        verifyTeacher: builder.mutation({
            query: (otpData) => ({
                url: "/verify-otp-teacher",
                method: "POST",
                body: otpData,
            }),
            invalidatesTags: ["auth"],
            transformResponse: (response) => {
                if (response?.teacher) {
                    localStorage.setItem("teacher", JSON.stringify(response.teacher));
                }
                return response;
            }
        }),

        logoutTeacher: builder.mutation({
            query: () => ({
                url: "/logout",
                method: "POST",
            }),
            invalidatesTags: ["auth"],
            transformResponse: (response) => {
                localStorage.removeItem("teacher");
                localStorage.removeItem("token");
                return response;
            },
        }),
        getTeacherProfile: builder.query({
            query: () => ({
                url: "/get-profile-teacher",
                method: "GET",
            }),
            providesTags: ["Dashboard"],
        }),
        updateTeacherProfile: builder.mutation({
            query: (formData) => ({
                url: "/update-profile-Teacher",
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Profile"],
        }),
        deleteTeacher: builder.mutation({
            query: () => ({
                url: "/delete-Teacher",
                method: "DELETE",
            }),
            invalidatesTags: ["auth"],
            transformResponse: (response) => {
                localStorage.removeItem("teacher");
                localStorage.removeItem("token");
                return response;
            },
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
    useDeleteTeacherMutation

} = authApi;