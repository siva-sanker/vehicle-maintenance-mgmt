import React, { useState } from 'react';
import '../styles/table.css';
import Pagination from './Pagination';


interface Column {
  key: string;
  header: string;
  renderCell?: (value: any, row: Record<string, any>) => React.ReactNode;
}

interface TableProps {
  columns: Column[]| string;
  data: Record<string, any>[];
}

const Table: React.FC<TableProps> = ({ columns, data }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Paginate data
  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      {/* <div className="table-container"> */}
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>No data found.</td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key} className='text-capitalize'>
                    {col.renderCell 
                      ? col.renderCell(row[col.key], row)
                      : typeof row[col.key] === 'number' 
                        ? row[col.key].toString()
                        : row[col.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
    {/* </div> */}
    <div>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    </>
  );
};

export default Table;