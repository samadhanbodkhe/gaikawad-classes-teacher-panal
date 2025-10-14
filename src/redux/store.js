import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/authApi";
import teacherAuthSlice from "./slice/authSlice"
import { leaveApi } from "./apis/leaveApi";
import { salaryApi } from "./apis/salaryApi";
import { scheduleApi } from "./apis/scheduleApi";
import { attendanceApi } from "./apis/attendanceApi";
import { createStudentApi } from "./apis/createStudentApi";
import { studentAttendanceApi } from "./apis/studentAttendanceApi";

const reduxStore = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [leaveApi.reducerPath]: leaveApi.reducer,
        [salaryApi.reducerPath]: salaryApi.reducer,
        [scheduleApi.reducerPath]: scheduleApi.reducer,
        [attendanceApi.reducerPath]: attendanceApi.reducer,
        [createStudentApi.reducerPath]: createStudentApi.reducer,
        [studentAttendanceApi.reducerPath]: studentAttendanceApi.reducer,
        auth: teacherAuthSlice,
    },
    middleware: def => [
        ...def(),
        authApi.middleware,
        leaveApi.middleware,
        salaryApi.middleware,
        scheduleApi.middleware,
        attendanceApi.middleware,
        createStudentApi.middleware,
        studentAttendanceApi.middleware,
    ]
})

export default reduxStore