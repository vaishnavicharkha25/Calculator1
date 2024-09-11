import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    address: '',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    logo: '',
  });

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/api/register', form);
      // Redirect to sign in page
      window.location.href = '/signin';
    } catch (error) {
      console.error('Failed to register', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <div className="form-grid">
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age:</label>
            <input
              id="age"
              name="age"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="primaryColor">Primary Color:</label>
            <input
              id="primaryColor"
              name="primaryColor"
              type="color"
              className='color-picker'
              value={form.primaryColor}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-column">
          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Home Address:</label>
            <input
              id="address"
              name="address"
              placeholder="Home Address"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="secondaryColor">Secondary Color:</label>
            <input
              id="secondaryColor"
              name="secondaryColor"
              type="color"
              className='color-picker'
              value={form.secondaryColor}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="form-group">
            <label htmlFor="logo">Logo URL:</label>
            <input
              id="logo"
              name="logo"
              placeholder="Logo URL"
              value={form.logo}
              onChange={handleChange}
            />
          </div>
      <button className="register-button" onClick={handleRegister}>Register</button>
      <a className="signin-link" href="/signin">Sign In</a>
    </div>
  );
};

export default RegisterPage;
