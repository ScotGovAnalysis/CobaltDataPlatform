import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Box } from '@mui/material';

const ComparisonModal = ({ open, onClose, columns, comparisonColumns, setComparisonColumns, compareColumns }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Compare Columns</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {columns.map(column => (
            <Grid item xs={4} key={column}>
              <Button
                variant={comparisonColumns.includes(column) ? 'contained' : 'outlined'}
                onClick={() => setComparisonColumns(prev =>
                  prev.includes(column)
                    ? prev.filter(c => c !== column)
                    : [...prev, column]
                )}
                fullWidth
              >
                {column}
              </Button>
            </Grid>
          ))}
        </Grid>
        {comparisonColumns.length > 1 && (
          <Box mt={3}>
            <Typography variant="h6">Comparative Analysis</Typography>
            <pre>{JSON.stringify(compareColumns(), null, 2)}</pre>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComparisonModal;