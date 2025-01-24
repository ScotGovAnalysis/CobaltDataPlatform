import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const InteractiveChart = ({ data, columns }) => {
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState(columns[1]);
  const [chartType, setChartType] = useState('bar');

  const chartData = [
    {
      x: data.map((row) => row[xAxis]),
      y: data.map((row) => row[yAxis]),
      type: chartType,
      mode: 'markers',
      marker: { color: 'blue' },
    },
  ];

  return (
    <div>
      <div>
        <label>X Axis:</label>
        <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
          {columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Y Axis:</label>
        <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
          {columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Chart Type:</label>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter">Scatter Plot</option>
        </select>
      </div>
      <Plot
        data={chartData}
        layout={{ width: 800, height: 400, title: 'Interactive Chart' }}
      />
    </div>
  );
};

export default InteractiveChart;