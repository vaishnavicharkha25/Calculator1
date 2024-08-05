import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Calculator from './components/Calculator';
import ShortPollingCalculator from './components/ShortPollingCalculator';
import LongPollingCalculator from './components/LongPollingCalculator';
import WebSocketCalculator from './components/WebSocketCalculator';
import Home from './components/Home';


function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Calculator />} />
          <Route path="/calculator/short-polling" element={<ShortPollingCalculator />} />
          <Route path="/calculator/long-polling" element={<LongPollingCalculator />} />
          <Route path="/calculator/web-socket" element={<WebSocketCalculator/>} />
        </Routes>
    </Router>
  );
}

export default App;