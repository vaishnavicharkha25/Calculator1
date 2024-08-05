import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => {

  return (
   <div className='home'>
       <Link to='/calculator/short-polling'><button className='btn'>Short-Polling</button></Link> 
       <Link to='/calculator/long-polling'><button className='btn'>Long-Polling</button></Link> 
       <Link to='/calculator/web-socket'><button className='btn'>Web-Socket</button></Link> 
   </div>
  );
};

export default Home;
