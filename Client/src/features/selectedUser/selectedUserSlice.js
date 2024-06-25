import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedUser: null,
};

export const selectedUserSlice = createSlice({
  name: 'selectedUser',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
});

export const { setSelectedUser, clearSelectedUser } = selectedUserSlice.actions;

export const selectSelectedUser = (state) => state.selectedUser.selectedUser;

export default selectedUserSlice.reducer;
