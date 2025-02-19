import React, { useState, useEffect , useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { Bar, Line, Scatter, Pie, Doughnut } from 'react-chartjs-2';
import {
  BarChart as BarChartIcon,
  StackedLineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterPlotIcon,
  ArrowDropDown as DropDownIcon,
  Download as DownloadIcon,
  Compare as CompareIcon,
  Analytics as AnalyticsIcon
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
  // State Management
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxis, setYAxis] = useState('count'); // Default Y-axis is "Count"
  const [chartType, setChartType] = useState('bar');
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [comparisonColumns, setComparisonColumns] = useState([]);
  const safeColumns = columns || [];
  const safeData = data || [];

  // Chart Reference for Interactions
  const chartRef = useRef(null);

  // Chart Type Configuration
  const chartTypes = [
    { type: 'bar', icon: <BarChartIcon /> },
    { type: 'line', icon: <LineChartIcon /> },
    { type: 'scatter', icon: <ScatterPlotIcon /> },
    { type: 'pie', icon: <PieChartIcon /> },
    { type: 'doughnut', icon: <PieChartIcon /> }
  ];
  useEffect(() => {
    if (safeColumns.length > 0) {
      setXAxis(safeColumns[0]);
    }
  }, [safeColumns]);
  // Advanced Statistical Analysis
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

  
  // Export Functionality
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

  // Comparative Analysis
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
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Advanced Data Explorer
      </Typography>

      {/* Export and Analysis Buttons */}
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
          >
            Export Data
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

      {/* Axis and Chart Type Selection */}
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
          includeCount // Add "Count" option for Y-axis
        />
        <ChartTypeSelector
          chartType={chartType}
          setChartType={setChartType}
          chartTypes={chartTypes}
        />
      </Box>

      {/* Main Chart Area */}
      <Paper sx={{ p: 3, height: 500 }}>
        <ChartRenderer
          chartType={chartType}
          data={data}
          xAxis={xAxis}
          yAxis={yAxis}
          chartRef={chartRef}
        />
      </Paper>

      {/* Comparison Modal */}
      <ComparisonModal
        open={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        columns={columns}
        comparisonColumns={comparisonColumns}
        setComparisonColumns={setComparisonColumns}
        compareColumns={compareColumns}
      />

      {/* Statistics Modal */}
      <ColumnStatisticsModal
        open={statisticsModalOpen}
        onClose={() => setStatisticsModalOpen(false)}
        columns={columns}
        computeStatistics={computeStatistics}
      />

      {/* Snackbar for Notifications */}
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