// src/components/Calculator4.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Calculator.css';
import LogTable from './LogTable'; // Import LogTable component

const Calculator4 = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState([]); // Add state for logs

  useEffect(() => {
    if (input) {
      try {
        setResult(eval(input).toString());
      } catch (error) {
        setResult('Error');
      }
    } else {
      setResult('');
    }
  }, [input]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleClick = (value) => {
    if (input.length < 15) {
      setInput((prev) => prev + value);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleEqual = async () => {
    if (!input) {
      alert('Expression is empty');
      return;
    }

    const isValid = result !== 'Error';
    try {
      const response = await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        is_valid: isValid,
        output: isValid ? parseFloat(result) : null,
      });

      const newLog = response.data;
      setLogs((prevLogs) => [newLog, ...prevLogs]); // Update logs immediately

      if (isValid) {
        setInput(result);
      } else {
        alert('Expression is invalid');
        setInput('');
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  return (
    <div className='main'>
      <div className="calculator">
        <div className="display">
          <div className="input">{input || ''}</div>
          <div className="result">{result}</div>
        </div>
        <div className="buttons">
          <button className="operator" onClick={handleClear}>AC</button>
          <button className="operator" onClick={() => handleClick('%')}>%</button>
          <button className="operator" onClick={handleBackspace}>⌫</button>
          <button className="operator operation" onClick={() => handleClick('/')}>÷</button>
          <button onClick={() => handleClick('7')}>7</button>
          <button onClick={() => handleClick('8')}>8</button>
          <button onClick={() => handleClick('9')}>9</button>
          <button className="operator operation" onClick={() => handleClick('*')}>×</button>
          <button onClick={() => handleClick('4')}>4</button>
          <button onClick={() => handleClick('5')}>5</button>
          <button onClick={() => handleClick('6')}>6</button>
          <button className="operator operation" onClick={() => handleClick('-')}>-</button>
          <button onClick={() => handleClick('1')}>1</button>
          <button onClick={() => handleClick('2')}>2</button>
          <button onClick={() => handleClick('3')}>3</button>
          <button className="operator operation" onClick={() => handleClick('+')}>+</button>
          <button onClick={() => handleClick('0')}>0</button>
          <button onClick={() => handleClick('00')}>00</button>
          <button onClick={() => handleClick('.')}>.</button>
          <button onClick={handleEqual} className="equal">=</button>
        </div>
      </div>
      <LogTable logs={logs} /> {/* Pass logs as prop to LogTable */}
    </div>
  );
};

export default Calculator4;
