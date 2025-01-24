import React, { useState, useMemo } from 'react';
import StatisticsTable from '../components/StatisticsTable';
import Chart from '../components/Chart';

import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const DatasetAnalysis = ({ data, columns }) => {
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState('count');
  const [chartType, setChartType] = useState('bar');

  const statistics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const stats = {};
    columns.forEach(column => {
      const numericValues = data
        .map(row => Number(row[column]))
        .filter(val => !isNaN(val));

      if (numericValues.length > 0) {
        stats[column] = {
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          count: numericValues.length
        };
      }
    });

    return stats;
  }, [data, columns]);

  const chartData = useMemo(() => {
    if (yAxis === 'count') {
      const counts = data.reduce((acc, row) => {
        const key = row[xAxis];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      return Object.keys(counts).map(key => ({
        x: key,
        y: counts[key]
      }));
    } else {
      return data.map((row) => ({
        x: row[xAxis],
        y: row[yAxis]
      }));
    }
  }, [data, xAxis, yAxis]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dataset Analysis
      </Typography>

      <Box display="flex" gap={2} mb={4}>
        <FormControl fullWidth>
          <InputLabel>X Axis</InputLabel>
          <Select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
            {columns.map((column) => (
              <MenuItem key={column} value={column}>
                {column}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Y Axis</InputLabel>
          <Select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
            {['count', ...columns].map((column) => (
              <MenuItem key={column} value={column}>
                {column}
              </MenuItem>
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
      </Box>

      <Box mt={4}>
        <Chart chartType={chartType} chartData={chartData} />
      </Box>

      {statistics && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Column Statistics
          </Typography>
          <StatisticsTable statistics={statistics} />
        </Box>
      )}
    </Container>
  );
};

export default DatasetAnalysis;
