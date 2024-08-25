import React, { useState, useEffect } from 'react';
import '../styles/LogTable.css';
import { FaChevronLeft, FaChevronRight, FaFilter, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const formatDateForComparison = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const ReusableTable = ({ rows, columns, deleteApiUrl, rowIdKey }) => {
  const [filteredRows, setFilteredRows] = useState(rows);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState({});
  const [filter, setFilter] = useState({});
  const [tempFilter, setTempFilter] = useState({});
  const [filterModal, setFilterModal] = useState({});

  useEffect(() => {
    const filtered = rows.filter((row) => {
      return Object.keys(filter).every(key => {
        if (key === 'date') {
          const rowDate = formatDateForComparison(row[key]);
          return !filter[key] || rowDate.includes(filter[key]);
        }
        return !filter[key] || row[key]?.toString().toLowerCase().includes(filter[key].toString().toLowerCase());
      });
    });
    setFilteredRows(filtered);
    setCurrentPage(1);
  }, [filter, rows]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updatedSelection = {};
    filteredRows.forEach((row) => {
      updatedSelection[row[rowIdKey]] = isChecked;
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

  const openFilterModal = (column) => {
    setFilterModal((prev) => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const resetFilter = (column) => {
    setTempFilter((prev) => ({
      ...prev,
      [column]: ''
    }));

    setFilterModal((prev) => ({
      ...prev,
      [column]: false
    }));

    setFilter((prev) => ({
      ...prev,
      [column]: ''
    }));
  };

  const searchFilter = () => {
    setFilter(tempFilter);
    setFilterModal({});
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

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
    const isConfirmed = window.confirm('Are you sure you want to delete the selected rows?');
    if (!isConfirmed) return;

    try {
      const idsToDelete = Object.keys(selectedRows).filter(id => selectedRows[id]);
      if (idsToDelete.length === 0) return;

      await axios.delete(deleteApiUrl, { data: { ids: idsToDelete } });

      setFilteredRows((prevRows) => prevRows.filter(row => !idsToDelete.includes(row[rowIdKey].toString())));
      setSelectedRows({});
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  };

  const anyRowsSelected = Object.values(selectedRows).some(isSelected => isSelected);

  return (
    <div className="log-table">
      <div className='table-head'>
        <h2 className='table-heading'>{columns.tableHeading || 'Table'}</h2>
        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={!anyRowsSelected}
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
                checked={filteredRows.length > 0 && filteredRows.every(row => selectedRows[row[rowIdKey]])}
              />
            </th>
            {columns.columns.map((col) => (
              <th key={col.id}>
                {col.title}
                {col.filterable && (
                  <FaFilter
                    size={14}
                    className="filter-icon"
                    onClick={() => openFilterModal(col.id)}
                  />
                )}
                {filterModal[col.id] && (
                  <div className="filter-modal">
                    {col.type === 'date' ? (
                      <input
                        type="text"
                        placeholder={`YYYY-MM-DD`}
                        value={tempFilter[col.id] || ''}
                        onChange={(e) => handleFilterChange(e, col.id)}
                      />
                    ) : (
                      <input
                        type={col.type || 'text'}
                        placeholder={`Filter ${col.title}`}
                        value={tempFilter[col.id] || ''}
                        onChange={(e) => handleFilterChange(e, col.id)}
                      />
                    )}
                    <div className='filter-modal-btns'>
                      <button className='modal-btn' onClick={searchFilter}>Search</button>
                      <button className='modal-btn' onClick={() => resetFilter(col.id)}>Reset</button>
                    </div>
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((row) => (
              <tr key={row[rowIdKey]}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!selectedRows[row[rowIdKey]]}
                    onChange={(e) => handleRowSelection(e, row[rowIdKey])}
                  />
                </td>
                {columns.columns.map((col) => (
                  <td key={col.id}>
                    {col.render ? col.render(row[col.id]) : row[col.id]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.columns.length + 1}>No data available</td>
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

export default ReusableTable;
