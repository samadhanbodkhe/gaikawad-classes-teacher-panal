import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { teacher: null, token: null },
  reducers: {
    loginSuccess: (state, action) => {
      state.teacher = action.payload.teacher;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.teacher = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("teacher");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
