import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

const StatisticsTable = ({ statistics }) => {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Column</TableCell>
            <TableCell>Mean</TableCell>
            <TableCell>Min</TableCell>
            <TableCell>Max</TableCell>
            <TableCell>Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(statistics).map(([column, stat]) => (
            <TableRow key={column}>
              <TableCell>{column}</TableCell>
              <TableCell>{stat.mean.toFixed(2)}</TableCell>
              <TableCell>{stat.min}</TableCell>
              <TableCell>{stat.max}</TableCell>
              <TableCell>{stat.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default StatisticsTable;
