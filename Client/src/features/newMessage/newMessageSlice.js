// newMessageSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const newMessageSlice = createSlice({
    name: 'newMessage',
    initialState: null,
    reducers: {
        setNewMessage: (state, action) => action.payload,
        clearNewMessage: () => null,
    },
});

export const { setNewMessage, clearNewMessage } = newMessageSlice.actions;

export default newMessageSlice.reducer;
