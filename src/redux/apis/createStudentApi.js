import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const createStudentApi = createApi({
    reducerPath: "createStudentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/student`,
        credentials: "include",
    }),
    tagTypes: ["Student"],
    endpoints: (builder) => ({
        createStudent: builder.mutation({
            query: (studentData) => ({
                url: "/createStudent",
                method: "POST", 
                body: studentData,
            }),
            invalidatesTags: ["Student"],
        }),
        getAllStudents: builder.query({
            query: () => ({
                url: "/getAllStudents",
                method: "GET",
            }),
            providesTags: ["Student"],
        }),
        getStudentById: builder.query({
            query: (id) => ({
                url: `/getStudentById/${id}`,
                method: "GET",
            }),
            providesTags: ["Student"],
        }),
        updateStudent: builder.mutation({
            query: ({ id, ...studentData }) => ({
                url: `/updateStudent/${id}`,
                method: "PUT",
                body: studentData,
            }),
            invalidatesTags: ["Student"],
        }),
        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `/deleteStudent/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Student"],
        }),
    }),
});

export const { 
    useCreateStudentMutation, 
    useGetAllStudentsQuery, 
    useGetStudentByIdQuery, 
    useUpdateStudentMutation, 
    useDeleteStudentMutation 
} = createStudentApi;