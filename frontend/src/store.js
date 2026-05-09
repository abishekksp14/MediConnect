import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import doctorReducer from './features/doctorSlice';
import appointmentReducer from './features/appointmentSlice';
import prescriptionReducer from './features/prescriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorReducer,
    appointments: appointmentReducer,
    prescriptions: prescriptionReducer,
  },
});
