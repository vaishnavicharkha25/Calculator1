import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice'; 
import { Link } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const primaryColor = user?.primaryColor || '#FFFFFF';
  const secondaryColor = user?.secondaryColor || '#000000';
  const logo = user?.logo || '';

  const handleLogout = () => {
    dispatch(logout()); 
    window.location.href = '/signin'; 
  };

  const containerStyle = {
    backgroundColor: primaryColor,
    color: secondaryColor,
  };

  return (
    <div style={containerStyle}>
      <div className='navbar'>
        <img src={logo} alt="Profile" style={{ maxWidth: '80px', maxHeight: '50px' }} />
        <div className='nav-items'>
          <Link className='nav-link' to="/home" style={{ color: secondaryColor }}>Home</Link>
          <Link className='nav-link' to="/profile" style={{ color: secondaryColor }}>Profile</Link>
          <Link className='nav-link' onClick={handleLogout} style={{ color: secondaryColor, background: 'none', border: 'none', cursor: 'pointer' }}>Logout</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
