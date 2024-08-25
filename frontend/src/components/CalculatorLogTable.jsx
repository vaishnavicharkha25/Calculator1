// src/components/CalculatorLogsTable.js
import React from 'react';
import ReusableTable from './ReusableTable';

const columns = {
  tableHeading: 'Calculator Logs',
  columns: [
    { id: 'id', title: 'ID', filterable: true },
    { id: 'expression', title: 'Expression', filterable: true },
    { id: 'is_valid', title: 'Is Valid', filterable: true, type: 'select' },
    { id: 'mobile', title: 'Mobile', filterable: true },
    { id: 'created_on', title: 'Created On', filterable: true, type: 'date' }
  ]
};

const dummyLogs = [
  { id: '1', expression: '2 + 2', is_valid: true, output: '4', created_on: '2024-08-01T10:00:00Z' },
  { id: '2', expression: '5 / 0', is_valid: false, mobile: null, created_on: '2024-08-02T11:00:00Z' }
  // Add more dummy data as needed
];

const CalculatorLogsTable = () => (
  <ReusableTable rows={dummyLogs} columns={columns} />
);

export default CalculatorLogsTable;
