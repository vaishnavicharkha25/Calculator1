import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../redux/slices/authSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchProfileData } from '../redux/slices/profileSlice'; 

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      
      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      
      dispatch(fetchProfileData());

      navigate('/home');
    } catch (error) {
      console.error('Failed to sign in', error);
    }
  };

  return (
    <div className="signin-container">
      <h1 className="signin-heading">Sign In</h1>
      <div className="form-group" style={{paddingBottom:'15px'}}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="signin-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signin-input"
        />
      </div>
      <button className="signin-button" onClick={handleSignIn}>Sign In</button>
      <a className="register-link" href="/register">Register</a>
    </div>
  );
};

export default SignInPage;
