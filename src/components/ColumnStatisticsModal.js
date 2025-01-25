import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid } from '@mui/material';

const ColumnStatisticsModal = ({ open, onClose, columns, computeStatistics }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Advanced Column Statistics</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {columns.map(column => {
            const stats = computeStatistics(column);
            return (
              <Grid item xs={12} key={column}>
                <Typography variant="h6">{column}</Typography>
                <pre>{JSON.stringify(stats, null, 2)}</pre>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnStatisticsModal;