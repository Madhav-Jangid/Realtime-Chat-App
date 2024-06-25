import { configureStore } from '@reduxjs/toolkit';
import selectedUserReducer from '../features/selectedUser/selectedUserSlice';
import newMessageReducer from '../features/newMessage/newMessageSlice';

const store = configureStore({
  reducer: {
    selectedUser: selectedUserReducer,
    newMessage: newMessageReducer,
  },
});

export default store;
