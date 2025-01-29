const DataTable = ({ selectedColumns, paginatedData, sortConfig, handleSort }) => (
    <table className="ds_table">
      <thead>
        <tr>
          {selectedColumns.map(header => (
            <th key={header} onClick={() => handleSort(header)} style={{ cursor: 'pointer' }}>
              {header}
              {sortConfig.key === header && (
                <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedData.map((row, index) => (
          <tr key={index}>
            {selectedColumns.map(col => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  
  export default DataTable;