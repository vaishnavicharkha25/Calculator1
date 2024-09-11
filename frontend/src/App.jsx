import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import SignInPage from './components/SignInPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import './App.css';
import { useSelector } from 'react-redux';

const App = () => {
  const primaryColor = useSelector((state) => state.auth.user?.primaryColor || '#FFFFFF');
  const secondaryColor = useSelector((state) => state.auth.user?.secondaryColor || '#000000');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
  }, [primaryColor, secondaryColor]);

  

  return (
    <>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
};

export default App;
