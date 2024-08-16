import React, { useState, useEffect } from 'react';
import '../styles/LogTable.css'; // Include styles if necessary
import { FaChevronLeft, FaChevronRight, FaFilter, FaTrash } from 'react-icons/fa';
import axios from 'axios';

// Utility function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';

  const formattedHours = hours % 12 || 12;
  return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

// Utility function to format date for comparison
const formatDateForComparison = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Format for comparison as YYYY-MM-DD
};

const LogTable = ({ logs }) => {
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState({});
  const [filter, setFilter] = useState({
    id: '',
    expression: '',
    is_valid: '',
    output: '',
    created_on: '' // Date input as a string in YYYY-MM-DD format
  });
  const [tempFilter, setTempFilter] = useState(filter); // Temporary filter state
  const [filterModal, setFilterModal] = useState({
    id: false,
    expression: false,
    is_valid: false,
    output: false,
    created_on: false
  });

  useEffect(() => {
    // Filter logs whenever filter state or logs change
    const filtered = logs.filter((log) => {
      const idMatch = log.id ? log.id.toString().includes(filter.id) : false;
      const expressionMatch = log.expression ? log.expression.toLowerCase().includes(filter.expression.toLowerCase()) : false;
      const isValidMatch = filter.is_valid === '' || (filter.is_valid === 'Yes' && log.is_valid) || (filter.is_valid === 'No' && !log.is_valid);
      const outputMatch = filter.output === '' || (log.output && log.output.toString().startsWith(filter.output));

      // Ensure date comparison
      const logDate = formatDateForComparison(log.created_on);
      const createdOnMatch = filter.created_on === '' || filter.created_on === logDate;

      return idMatch && expressionMatch && isValidMatch && outputMatch && createdOnMatch;
    });
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filter, logs]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updatedSelection = {};
    filteredLogs.forEach((log) => {
      updatedSelection[log.id] = isChecked;
    });
    setSelectedRows(updatedSelection);
  };

  const handleRowSelection = (e, id) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: e.target.checked
    }));
  };

  const handleFilterChange = (e, column) => {
    setTempFilter((prev) => ({
      ...prev,
      [column]: e.target.value
    }));
  };

  const handleDateChange = (e) => {
    setTempFilter((prev) => ({
      ...prev,
      created_on: e.target.value
    }));
  };

  const openFilterModal = (column) => {
    // Close any other open filter modals
    setFilterModal((prev) => {
      const updated = { id: false, expression: false, is_valid: false, output: false, created_on: false };
      updated[column] = !prev[column]; // Toggle current filter modal
      return updated;
    });
  };

 
  const resetFilter = (column) => {
    // Reset the specific column filter to empty
    setTempFilter((prev) => ({
      ...prev,
      [column]: column === 'created_on' ? '' : ''
    }));

    // Close the filter modal
    setFilterModal((prev) => ({
      ...prev,
      [column]: false
    }));

    // Reset filter to initial state
    if (column === 'created_on') {
      setFilter((prev) => ({
        ...prev,
        created_on: ''
      }));
    }
  };

  const searchFilter = () => {
    // Apply the filter from tempFilter
    setFilter(tempFilter);
    // Close all filter modals after search
    setFilterModal({
      id: false,
      expression: false,
      is_valid: false,
      output: false,
      created_on: false
    });
  };

  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const handlePagination = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationButtons = () => {
    const buttons = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      buttons.push(1);
      if (startPage > 2) buttons.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push('...');
      buttons.push(totalPages);
    }

    return buttons;
  };

  const handleDelete = async () => {
    // Confirm deletion
    const isConfirmed = window.confirm('Are you sure you want to delete the selected logs?');
    if (!isConfirmed) return; // Abort if not confirmed

    try {
      const idsToDelete = Object.keys(selectedRows).filter(id => selectedRows[id]);
      if (idsToDelete.length === 0) return; // No rows selected

      await axios.delete('http://localhost:5000/api/logs', { data: { ids: idsToDelete } });

      // Remove deleted logs from local state
      setFilteredLogs((prevLogs) => prevLogs.filter(log => !idsToDelete.includes(log.id.toString())));
      setSelectedRows({}); // Clear selection
    } catch (error) {
      console.error('Error deleting logs:', error);
    }
  };

  // Determine if any rows are selected
  const anyRowsSelected = Object.values(selectedRows).some(isSelected => isSelected);

  return (
    <div className="log-table">
      <div className='table-head'>
        <h2 className='table-heading'>Calculator Logs</h2>
        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={!anyRowsSelected} // Disable if no rows are selected
        >
          <FaTrash size={16} />
        </button>
      </div>
      <table id='log'>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={filteredLogs.length > 0 && filteredLogs.every(log => selectedRows[log.id])}
              />
            </th>
            <th>
              ID
              <FaFilter size={14}
                className="filter-icon"
                onClick={() => openFilterModal('id')}
                onDoubleClick={() => openFilterModal('id')}
              />
              {filterModal.id && (
                <div className="filter-modal">
                  <input
                    type="text"
                    placeholder="Filter ID"
                    value={tempFilter.id}
                    onChange={(e) => handleFilterChange(e, 'id')}
                  />
                  <div className='filter-modal-btns'>
                  <button className='modal-btn' onClick={searchFilter}>Search</button>
                  <button className='modal-btn' onClick={() => resetFilter('id')}>Reset</button>
                  </div>
                </div>
              )}
            </th>
            <th>
              Expression
              <FaFilter size={14}
                className="filter-icon"
                onClick={() => openFilterModal('expression')}
                onDoubleClick={() => openFilterModal('expression')}
              />
              {filterModal.expression && (
                <div className="filter-modal">
                  <input
                    type="text"
                    placeholder="Filter Expression"
                    value={tempFilter.expression}
                    onChange={(e) => handleFilterChange(e, 'expression')}
                  />
                 <div className='filter-modal-btns'>
                  <button className='modal-btn' onClick={searchFilter}>Search</button>
                  <button className='modal-btn' onClick={() => resetFilter('expression')}>Reset</button>
                </div>
                </div>
              )}
            </th>
            <th>
              Is Valid
              <FaFilter size={14}
                className="filter-icon"
                onClick={() => openFilterModal('is_valid')}
                onDoubleClick={() => openFilterModal('is_valid')}
              />
              {filterModal.is_valid && (
                <div className="filter-modal">
                  <select
                    value={tempFilter.is_valid}
                    onChange={(e) => handleFilterChange(e, 'is_valid')}
                  >
                    <option value="">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <div className='filter-modal-btns'>
                  <button className='modal-btn' onClick={searchFilter}>Search</button>
                  <button className='modal-btn' onClick={() => resetFilter('is_valid')}>Reset</button>
                </div>
                </div>
              )}
            </th>
            <th>
              Output
              <FaFilter size={14}
                className="filter-icon"
                onClick={() => openFilterModal('output')}
                onDoubleClick={() => openFilterModal('output')}
              />
              {filterModal.output && (
                <div className="filter-modal">
                  <input
                    type="text"
                    placeholder="Filter Output"
                    value={tempFilter.output}
                    onChange={(e) => handleFilterChange(e, 'output')}
                  />
                  <div className='filter-modal-btns'>
                  <button className='modal-btn' onClick={searchFilter}>Search</button>
                  <button className='modal-btn' onClick={() => resetFilter('output')}>Reset</button>
                </div>
                </div>
              )}
            </th>
            <th>
              Created On
              <FaFilter size={14}
                className="filter-icon"
                onClick={() => openFilterModal('created_on')}
                onDoubleClick={() => openFilterModal('created_on')}
              />
              {filterModal.created_on && (
                <div className="filter-modal">
                  <input
                    type="date"
                    value={tempFilter.created_on}
                    onChange={handleDateChange}
                  />
                  <div className='filter-modal-btns'>
                  <button className='modal-btn' onClick={searchFilter}>Search</button>
                  <button className='modal-btn' onClick={() => resetFilter('created_on')}>Reset</button>
                </div>
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.length > 0 ? (
            currentLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!selectedRows[log.id]}
                    onChange={(e) => handleRowSelection(e, log.id)}
                  />
                </td>
                <td>{log.id}</td>
                <td>{log.expression}</td>
                <td>{log.is_valid ? 'Yes' : 'No'}</td>
                <td>{log.output}</td>
                <td>{formatDate(log.created_on)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => handlePagination(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft size={16} />
        </button>
        {getPaginationButtons().map((button, index) => (
          <button
            key={index}
            onClick={() => handlePagination(typeof button === 'number' ? button : currentPage)}
            className={typeof button === 'number' && button === currentPage ? 'active' : ''}
            disabled={typeof button !== 'number'}
          >
            {button}
          </button>
        ))}
        <button
          onClick={() => handlePagination(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default LogTable;
