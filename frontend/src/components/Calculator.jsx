import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Calculator.css';
import Home from './Home';
import { evaluate } from 'mathjs'; // Use mathjs for safe evaluation

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs(); // Initial fetch
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
      setInput(prev => prev + value);
      setError('');
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleEqual = async () => {
    if (!input) {
      setError('Expression is empty');
      return;
    }

    try {
      const evaluatedResult = evaluate(input).toString();
      setResult(evaluatedResult);

      const isValid = !isNaN(evaluatedResult);
      const response = await axios.post('http://localhost:5000/api/logs', {
        expression: input,
        is_valid: isValid,
        output: isValid ? parseFloat(evaluatedResult) : null,
      });

      // Update logs immediately without refetching from server
      const newLog = response.data; // Assuming server returns the new log entry
      setLogs(prevLogs => [newLog, ...prevLogs]);

      if (isValid) {
        setInput(evaluatedResult);
      } else {
        setError('Expression is invalid');
        setInput('');
      }
    } catch (error) {
      console.error('Error adding log:', error);
      setError('Error evaluating expression');
    }
  };

  return (
    <div>
      <Home />
      <div className='main'>
        <div className="calculator">
          <div className="display">
            <div className="input">{input || ''}</div>
            <div className="result">{result || ''}</div>
            {error && <div className="error">{error}</div>}
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
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.expression}</td>
                    <td>{log.is_valid ? 'Yes' : 'No'}</td>
                    <td>{log.output !== null ? log.output : 'N/A'}</td>
                    <td>{new Date(log.created_on).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
