import React from 'react';
import ReusableTable from './ReusableTable';

const columns = {
  tableHeading: 'User Data',
  columns: [
    { id: 'userid', title: 'User ID', filterable: true },
    { id: 'userName', title: 'User Name', filterable: true },
    { id: 'email', title: 'Email', filterable: true },
    { id: 'mobile', title: 'Mobile No.', filterable: true },
    { id: 'dateJoined', title: 'Date Joined', filterable: true, type: 'date' }
  ]
};

const dummyUsers = [
  { userid: '101', userName: 'ABC', email: 'abc@gmail.com', mobile: '0123456789',  dateJoined: '2024-01-15T09:30:00Z' },
  { userid: '102', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '103', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' }, 
  { userid: '104', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '105', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '106', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '107', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '108', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '109', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' }, 
  { userid: '110', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '111', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '112', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '113', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },  
  { userid: '114', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' },
  { userid: '115', userName: 'XYZ', email: 'xyz@gmail.com', mobile: '9876543210', dateJoined: '2024-01-16T10:45:00Z' }, 


];

const UserDataTable = () => (
  <ReusableTable
    rows={dummyUsers}
    columns={columns}
    deleteApiUrl="http://localhost:5000/delete"
    rowIdKey="userid"
  />
);

export default UserDataTable;
