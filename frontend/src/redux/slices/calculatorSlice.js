import { createSlice } from '@reduxjs/toolkit';

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: {
    input: '',  
    result: '',
    logs: [],
  },
  reducers: {
    setInput: (state, action) => {
      state.input = action.payload;
    },
    setResult: (state, action) => {
      state.result = action.payload;
    },
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    addLog: (state, action) => {
      state.logs = [action.payload, ...state.logs];
    },
  },
});

export const { setInput, setResult, setLogs, addLog } = calculatorSlice.actions;
export default calculatorSlice.reducer;
