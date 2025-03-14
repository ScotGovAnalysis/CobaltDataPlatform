import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  StackedLineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Download as DownloadIcon,
  Compare as CompareIcon,
  Analytics as AnalyticsIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import * as htmlToImage from 'html-to-image';
import * as XLSX from 'xlsx';
import { jStat } from 'jstat';
import { calculateMode } from '../components/Utils';
import ChartRenderer from '../components/ChartRenderer';
import ColumnStatisticsModal from '../components/ColumnStatisticsModal';
import ComparisonModal from '../components/ComparisonModal';
import AxisSelector from '../components/AxisSelector';
import ChartTypeSelector from '../components/ChartTypeSelector';

const AdvancedDataExplorer = ({ data, columns }) => {
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState('count');
  const [chartType, setChartType] = useState('bar');
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [comparisonColumns, setComparisonColumns] = useState([]);
  const [colorSeed, setColorSeed] = useState(Date.now());
  const chartRef = useRef(null);
  const safeColumns = columns || [];
  const safeData = data || [];

  const chartTypes = [
    { type: 'bar', icon: <BarChartIcon /> },
    { type: 'line', icon: <LineChartIcon /> },
    { type: 'scatter', icon: <ScatterPlotIcon /> },
    { type: 'pie', icon: <PieChartIcon /> },
    { type: 'doughnut', icon: <PieChartIcon /> }
  ];

  const handleReset = useCallback(() => {
    setXAxis(safeColumns[0]);
    setYAxis('count');
    setChartType('bar');
    setColorSeed(Date.now());
    
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }

    setSnackbarMessage('Chart view and settings reset');
    setSnackbarOpen(true);
  }, [safeColumns]);

  useEffect(() => {
    if (safeColumns.length > 0) {
      setXAxis(safeColumns[0]);
    }
  }, [safeColumns]);

  const computeStatistics = useCallback((column) => {
    if (!safeData.length) return null;

    const numericValues = safeData
      .map(row => Number(row[column]))
      .filter(val => !isNaN(val));

    if (numericValues.length === 0) return null;

    return {
      count: numericValues.length,
      mean: jStat.mean(numericValues),
      median: jStat.median(numericValues),
      mode: calculateMode(numericValues),
      variance: jStat.variance(numericValues),
      standardDeviation: jStat.stdev(numericValues),
      min: jStat.min(numericValues),
      max: jStat.max(numericValues),
      skewness: jStat.skewness(numericValues),
      kurtosis: jStat.kurtosis(numericValues)
    };
  }, [data]);

  const exportChartAsPNG = useCallback(() => {
    if (chartRef.current) {
      htmlToImage.toPng(chartRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'chart_export.png';
          link.href = dataUrl;
          link.click();
          setSnackbarMessage('Chart exported successfully!');
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error('Export failed', error);
          setSnackbarMessage('Export failed');
          setSnackbarOpen(true);
        });
    }
  }, []);

  const exportDataToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'data_export.xlsx');
    setSnackbarMessage('Data exported successfully!');
    setSnackbarOpen(true);
  }, [data]);

  const compareColumns = useCallback(() => {
    if (comparisonColumns.length < 2) {
      setSnackbarMessage('Select at least two columns to compare');
      setSnackbarOpen(true);
      return;
    }

    const comparativeStats = comparisonColumns.map(column => ({
      column,
      ...computeStatistics(column)
    }));

    return comparativeStats;
  }, [comparisonColumns, computeStatistics]);

  return (
    <Container maxWidth="xl" sx={{ padding: 0 }}>
<Typography variant="h4" sx={{ mb: 3 }}>
  Data Analysis Tool
</Typography>

<Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.1 }}>
  <strong>How to Use This Chart</strong>
  <Box component="ul" sx={{ pl: 2, mt: 1, mb: 1 }}>
    <Box component="li" sx={{ mb: 1 }}>
      <strong>Choose your data:</strong> Select columns for the X and Y axes from the dropdowns.
    </Box>
    <Box component="li" sx={{ mb: 1 }}>
      <strong>Pick a chart type:</strong> Use the icons to switch between bar, line, pie, and more.
    </Box>
    <Box component="li" sx={{ mb: 1 }}>
      <strong>Interact:</strong> Zoom, pan, or hover for details. Click "Export" to save your chart or data.
    </Box>
    <Box component="li" sx={{ mb: 1 }}>
      <strong>Reset:</strong> Click the "Reset" button to restore the default view and settings.
    </Box>
  </Box>
</Typography>


      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportChartAsPNG}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Export Chart
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportDataToExcel}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Export Data
          </Button>
          <Button
            startIcon={<ResetIcon />}
            onClick={handleReset}
            variant="outlined"
            color="secondary"
          >
            Reset
          </Button>
        </Box>
        <Box>
          <Button
            startIcon={<CompareIcon />}
            onClick={() => setComparisonModalOpen(true)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Compare Columns
          </Button>
          <Button
            startIcon={<AnalyticsIcon />}
            onClick={() => setStatisticsModalOpen(true)}
            variant="outlined"
          >
            Column Statistics
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <AxisSelector
          axis={xAxis}
          setAxis={setXAxis}
          columns={columns}
          label="X-Axis"
          disabledAxis={yAxis}
        />
        <AxisSelector
          axis={yAxis}
          setAxis={setYAxis}
          columns={columns}
          label="Y-Axis"
          disabledAxis={xAxis}
          includeCount
        />
        <ChartTypeSelector
          chartType={chartType}
          setChartType={setChartType}
          chartTypes={chartTypes}
        />
      </Box>

      <Paper sx={{ 
        p: 3, 
        height: '70vh',
        minHeight: '500px',
        flex: 1, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <ChartRenderer
          chartType={chartType}
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          chartRef={chartRef}
          colorSeed={colorSeed}
          style={{ 
            width: '100%', 
            height: '100%',
            transition: 'all 0.3s ease'
          }}
        />
      </Paper>

      <ComparisonModal
        open={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        columns={columns}
        comparisonColumns={comparisonColumns}
        setComparisonColumns={setComparisonColumns}
        compareColumns={compareColumns}
      />

      <ColumnStatisticsModal
        open={statisticsModalOpen}
        onClose={() => setStatisticsModalOpen(false)}
        columns={columns}
        computeStatistics={computeStatistics}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdvancedDataExplorer;