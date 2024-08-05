import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Calculator.css';

const WebSocketCalculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState([]);
  let socket;

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
    socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, []);

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
      await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        is_valid: isValid,
        output: isValid ? parseFloat(result) : null,
      });

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
      <div className="log-table">
        <h2>Calculator Logs</h2>
        <table id='log'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Expression</th>
              <th>Is Valid</th>
              <th>Output</th>
              <th>Created On</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.expression}</td>
                <td>{log.is_valid ? 'True' : 'False'}</td>
                <td>{log.output}</td>
                <td>{log.created_on}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebSocketCalculator;
