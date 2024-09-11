import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: JSON.parse(localStorage.getItem('profile')) || {}, 
    loading: false,
    error: null,
  },
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
      localStorage.setItem('profile', JSON.stringify(action.payload)); 
    },
    updateProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload };
      localStorage.setItem('profile', JSON.stringify(state.profile)); 
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setProfile, updateProfile, setLoading, setError } = profileSlice.actions;

export const fetchProfileData = () => async (dispatch, getState) => {
  const { token } = getState().auth;

  if (!token) {
    dispatch(setError('No token available'));
    return;
  }

  dispatch(setLoading(true));
  
  try {
    const response = await axios.get('http://localhost:5000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Fetched profile data:', response.data); // Log the fetched data
    dispatch(setProfile(response.data));
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to fetch profile data';
    dispatch(setError(errorMsg));
    console.error('Failed to fetch profile data', error);
  } finally {
    dispatch(setLoading(false));
  }
};


export const saveProfileChanges = (profileData) => async (dispatch, getState) => {
  const { token } = getState().auth; 

  if (!token) {
    dispatch(setError('No token available'));
    return;
  }

  try {
    const response = await axios.put('http://localhost:5000/api/profile', profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch(updateProfile(response.data));
  } catch (error) {
    console.error('Failed to update profile', error);
    dispatch(setError('Failed to update profile'));
  }
};

export default profileSlice.reducer;
