import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/slices/authSlice';
import profileReducer from './redux/slices/profileSlice';
import { calculatorReducer } from './redux/reducers/calculatorReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    calculator: calculatorReducer,
  },
});

export default store;
