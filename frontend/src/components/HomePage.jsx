import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/authSlice'; 
import Navbar from './Navbar';
import Calculator4 from './Calculator4';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const loading = useSelector((state) => state.auth.loading);   
  const error = useSelector((state) => state.auth.error);  


  useEffect(() => {
    if (!token) {
      navigate('/signin');
    } else {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, navigate]);



  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>      
      <Navbar />
      <div className='pt-5'>
        <Calculator4 />
      </div>
    </div>
  );
};

export default HomePage;
