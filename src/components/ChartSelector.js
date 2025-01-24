import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ChartSelector = ({ columns, xAxis, setXAxis, yAxis, setYAxis, chartType, setChartType }) => {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <FormControl fullWidth>
        <InputLabel>X Axis</InputLabel>
        <Select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
          {columns.map((column) => (
            <MenuItem key={column} value={column}>{column}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Y Axis</InputLabel>
        <Select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
          {columns.map((column) => (
            <MenuItem key={column} value={column}>{column}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Chart Type</InputLabel>
        <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <MenuItem value="bar">Bar Chart</MenuItem>
          <MenuItem value="line">Line Chart</MenuItem>
          <MenuItem value="scatter">Scatter Plot</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default ChartSelector;
