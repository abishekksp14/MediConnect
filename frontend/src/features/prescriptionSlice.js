import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createPrescription = createAsyncThunk(
  'prescriptions/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/prescriptions', data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create prescription');
    }
  }
);

export const fetchPatientPrescriptions = createAsyncThunk(
  'prescriptions/fetchForPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/prescriptions/patient/${patientId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

export const fetchDoctorPrescriptions = createAsyncThunk(
  'prescriptions/fetchForDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/prescriptions/doctor/${doctorId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState: { list: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(fetchPatientPrescriptions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPatientPrescriptions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchDoctorPrescriptions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDoctorPrescriptions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      });
  },
});

export default prescriptionSlice.reducer;
