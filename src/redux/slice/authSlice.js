import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../apis/authApi";

const authSlice = createSlice({
    name: "authSlice",
    initialState: {
        teacher: JSON.parse(localStorage.getItem("teacher")) || null,
    },
    reducers: {},
    extraReducers: builder => builder
        .addMatcher(authApi.endpoints.verifyTeacher.matchFulfilled, (state, { payload }) => {
            state.teacher = payload
        })
        .addMatcher(authApi.endpoints.logoutTeacher.matchFulfilled, (state, { payload }) => {
            state.teacher = null
        })

})

export default authSlice.reducer