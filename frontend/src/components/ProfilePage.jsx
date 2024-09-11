import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileData, saveProfileChanges } from '../redux/slices/profileSlice';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile.profile);
  const loading = useSelector((state) => state.profile.loading);
  const error = useSelector((state) => state.profile.error);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    address: '',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    logo: ''
  });


  const [isEditing, setIsEditing] = useState(false);
  

  // 

  useEffect(() => {
    if (profile) {
      setForm(profile); 
    }
  }, [profile]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleSave = () => {
    dispatch(saveProfileChanges(form));
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Navbar />
      <div className="profile-container pt-5">
        <div className='profile-heading'>
          <h1>Profile</h1>
        </div>
        {!isEditing ? (
          <div className="profile-details">
            <div className="profile-row">
              <div className="profile-label">First Name:</div>
              <div className="profile-value">{form.firstName}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Last Name:</div>
              <div className="profile-value">{form.lastName}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Email:</div>
              <div className="profile-value">{form.email}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Age:</div>
              <div className="profile-value">{form.age}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Address:</div>
              <div className="profile-value">{form.address}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Primary Color:</div>
              <div className="profile-value">
                <div className="color-swatch" style={{ backgroundColor: form.primaryColor }}></div>
              </div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Secondary Color:</div>
              <div className="profile-value">
                <div className="color-swatch" style={{ backgroundColor: form.secondaryColor }}></div>
              </div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Logo URL:</div>
              <div className="profile-value">
                <img src={form.logo} alt="Logo" className="logo-image" />
              </div>
            </div>
            <div className='btn-flex'>
              <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
            </div>
          </div>
        ) : (
          <div className="profile-form">
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="firstName">First Name:</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName || ''} 
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email || ''} 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age:</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    value={form.age || ''} 
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
                    value={form.primaryColor || '#FFFFFF'} 
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
                    value={form.lastName || ''} 
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
                    value={form.password || ''} 
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address:</label>
                  <input
                    id="address"
                    name="address"
                    value={form.address || ''} 
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
                    value={form.secondaryColor || '#000000'} 
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
                value={form.logo || ''} 
                onChange={handleChange}
              />
            </div>
            <div className='btn-flex'>
              <button className="save-button" onClick={handleSave}>Save</button>
              <button className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
