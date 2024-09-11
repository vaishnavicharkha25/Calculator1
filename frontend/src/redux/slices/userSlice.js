import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
    token: null,
    status: 'idle',
  },
  reducers: {
    login: (state, action) => {
      state.userInfo = action.payload.userInfo;
      state.token = action.payload.token;
      state.status = 'loggedIn';
    },
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.status = 'loggedOut';
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
